import { createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { Prisma, type ReservationStatus } from "@prisma/client";
import {
  cancelReservationRequestSchema,
  createReservationRequestSchema,
  differenceInNights,
  lookupReservationRequestSchema,
  reservationCodeSchema,
  toDateOnly,
  toIsoDateOnly,
  type ReservationResponse,
} from "@hostel/shared";
import { sendError, sendValidationError } from "../lib/http.js";
import { pickLocale, serializeRoomType } from "../lib/localization.js";
import { prisma } from "../lib/prisma.js";
import type { createRateLimiter } from "../lib/rate-limit.js";
import { ACTIVE_RESERVATION_STATUSES, generateReservationCode } from "../lib/reservation-code.js";

const MAX_CODE_GENERATION_ATTEMPTS = 5;
const CREATE_RESERVATION_RATE_LIMIT = {
  max: 10,
  scope: "reservation-create",
  windowMs: 10 * 60 * 1000,
};
const LOOKUP_RESERVATION_RATE_LIMIT = {
  max: 15,
  scope: "reservation-lookup",
  windowMs: 60 * 1000,
};
const CANCEL_RESERVATION_RATE_LIMIT = {
  max: 8,
  scope: "reservation-cancel",
  windowMs: 60 * 1000,
};

type ReservationRouteOptions = {
  rateLimiter: ReturnType<typeof createRateLimiter>;
};

type ReservationWithRoomType = Prisma.ReservationGetPayload<{
  include: {
    room: {
      include: {
        roomType: true;
      };
    };
  };
}>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function emailMatches(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(normalizeEmail(left)).digest();
  const rightHash = createHash("sha256").update(normalizeEmail(right)).digest();

  return timingSafeEqual(leftHash, rightHash);
}

function serializeReservation(
  reservation: ReservationWithRoomType,
  locale: ReturnType<typeof pickLocale>,
): ReservationResponse {
  return {
    code: reservation.code,
    status: reservation.status,
    checkIn: toIsoDateOnly(reservation.checkIn),
    checkOut: toIsoDateOnly(reservation.checkOut),
    guestCount: reservation.guestCount,
    priceTotalBRL: reservation.priceTotalBRL.toFixed(2),
    roomType: serializeRoomType(reservation.room.roomType, locale),
  };
}

function isKnownPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

function isReservationOverlapError(error: unknown): boolean {
  if (!isKnownPrismaError(error)) return false;

  return error.code === "P2004" && JSON.stringify(error.meta ?? {}).includes("no_overlap_active");
}

function isUniqueConstraintError(error: unknown): boolean {
  return isKnownPrismaError(error) && error.code === "P2002";
}

async function findReservationForEmail(code: string, email: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { code },
    include: {
      room: {
        include: {
          roomType: true,
        },
      },
    },
  });

  if (!reservation || !emailMatches(reservation.guestEmail, email)) {
    return null;
  }

  return reservation;
}

export async function registerReservationRoutes(
  app: FastifyInstance,
  options: ReservationRouteOptions,
) {
  app.post("/v1/reservations", async (request, reply): Promise<ReservationResponse | void> => {
    if (!options.rateLimiter.consume(request, reply, CREATE_RESERVATION_RATE_LIMIT)) {
      return;
    }

    const parsedBody = createReservationRequestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      sendValidationError(reply, parsedBody.error);
      return;
    }

    const body = parsedBody.data;
    const locale = pickLocale(request.headers["accept-language"]);
    const roomType = await prisma.roomType.findUnique({
      where: { id: body.roomTypeId },
      include: {
        rooms: {
          where: {
            active: true,
            reservations: {
              none: {
                status: { in: ACTIVE_RESERVATION_STATUSES },
                checkIn: { lt: toDateOnly(body.checkOut) },
                checkOut: { gt: toDateOnly(body.checkIn) },
              },
            },
          },
          orderBy: { number: "asc" },
        },
      },
    });

    if (!roomType) {
      sendError(reply, 404, "ROOM_TYPE_NOT_FOUND", "Room type was not found.");
      return;
    }

    if (body.guestCount > roomType.capacity) {
      sendError(reply, 400, "VALIDATION_FAILED", "Guest count exceeds room capacity.", {
        capacity: roomType.capacity,
      });
      return;
    }

    const nights = differenceInNights(body.checkIn, body.checkOut);
    const priceTotalBRL = roomType.basePriceBRL.mul(nights);

    for (const room of roomType.rooms) {
      for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
        try {
          const reservation = await prisma.reservation.create({
            data: {
              code: generateReservationCode(),
              roomId: room.id,
              roomTypeId: roomType.id,
              guestName: body.guest.name,
              guestEmail: normalizeEmail(body.guest.email),
              guestPhone: body.guest.phone,
              guestCount: body.guestCount,
              checkIn: toDateOnly(body.checkIn),
              checkOut: toDateOnly(body.checkOut),
              priceTotalBRL,
              notes: body.notes,
            },
            include: {
              room: {
                include: {
                  roomType: true,
                },
              },
            },
          });

          return serializeReservation(reservation, locale);
        } catch (error) {
          if (isUniqueConstraintError(error)) {
            continue;
          }

          if (isReservationOverlapError(error)) {
            break;
          }

          throw error;
        }
      }
    }

    sendError(reply, 409, "ROOM_NO_LONGER_AVAILABLE", "No room is available for these dates.");
  });

  app.post(
    "/v1/reservations/:code/lookup",
    async (request, reply): Promise<ReservationResponse | void> => {
      if (!options.rateLimiter.consume(request, reply, LOOKUP_RESERVATION_RATE_LIMIT)) {
        return;
      }

      const parsedParams = reservationCodeSchema.safeParse(
        (request.params as { code?: unknown }).code,
      );
      const parsedBody = lookupReservationRequestSchema.safeParse(request.body);

      if (!parsedParams.success) {
        sendValidationError(reply, parsedParams.error);
        return;
      }

      if (!parsedBody.success) {
        sendValidationError(reply, parsedBody.error);
        return;
      }

      const reservation = await findReservationForEmail(parsedParams.data, parsedBody.data.email);
      if (!reservation) {
        sendError(reply, 404, "RESERVATION_NOT_FOUND", "Reservation was not found.");
        return;
      }

      return serializeReservation(reservation, pickLocale(request.headers["accept-language"]));
    },
  );

  app.post(
    "/v1/reservations/:code/cancel",
    async (request, reply): Promise<ReservationResponse | void> => {
      if (!options.rateLimiter.consume(request, reply, CANCEL_RESERVATION_RATE_LIMIT)) {
        return;
      }

      const parsedParams = reservationCodeSchema.safeParse(
        (request.params as { code?: unknown }).code,
      );
      const parsedBody = cancelReservationRequestSchema.safeParse(request.body);

      if (!parsedParams.success) {
        sendValidationError(reply, parsedParams.error);
        return;
      }

      if (!parsedBody.success) {
        sendValidationError(reply, parsedBody.error);
        return;
      }

      const reservation = await findReservationForEmail(parsedParams.data, parsedBody.data.email);
      if (!reservation) {
        sendError(reply, 404, "RESERVATION_NOT_FOUND", "Reservation was not found.");
        return;
      }

      const cancelledReservation = await prisma.reservation.update({
        where: { id: reservation.id },
        data: {
          status: "CANCELLED" satisfies ReservationStatus,
        },
        include: {
          room: {
            include: {
              roomType: true,
            },
          },
        },
      });

      return serializeReservation(
        cancelledReservation,
        pickLocale(request.headers["accept-language"]),
      );
    },
  );
}
