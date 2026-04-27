import type { FastifyInstance } from "fastify";
import {
  availabilityQuerySchema,
  roomTypeSlugSchema,
  toDateOnly,
  type AvailabilityResponse,
} from "@hostel/shared";
import { sendValidationError } from "../lib/http.js";
import { prisma } from "../lib/prisma.js";
import { ACTIVE_RESERVATION_STATUSES } from "../lib/reservation-code.js";

export async function registerAvailabilityRoutes(app: FastifyInstance) {
  app.get("/v1/availability", async (request, reply): Promise<AvailabilityResponse | void> => {
    const parsedQuery = availabilityQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      sendValidationError(reply, parsedQuery.error);
      return;
    }

    const { checkIn, checkOut, roomTypeId } = parsedQuery.data;
    const checkInDate = toDateOnly(checkIn);
    const checkOutDate = toDateOnly(checkOut);

    const roomTypes = await prisma.roomType.findMany({
      where: roomTypeId ? { id: roomTypeId } : undefined,
      include: {
        rooms: {
          where: { active: true },
          select: { id: true },
        },
      },
      orderBy: { capacity: "asc" },
    });

    const roomIds = roomTypes.flatMap((roomType) => roomType.rooms.map((room) => room.id));
    const reservedRooms =
      roomIds.length > 0
        ? await prisma.reservation.findMany({
            where: {
              roomId: { in: roomIds },
              status: { in: ACTIVE_RESERVATION_STATUSES },
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
            select: { roomId: true },
          })
        : [];

    const reservedRoomIds = new Set(reservedRooms.map((reservation) => reservation.roomId));

    return {
      checkIn,
      checkOut,
      roomTypes: roomTypes.map((roomType) => {
        const totalRooms = roomType.rooms.length;
        const availableRooms = roomType.rooms.filter(
          (room) => !reservedRoomIds.has(room.id),
        ).length;

        return {
          roomTypeId: roomType.id,
          slug: roomTypeSlugSchema.parse(roomType.slug),
          availableRooms,
          totalRooms,
        };
      }),
    };
  });
}
