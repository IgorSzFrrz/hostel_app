import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { sendError } from "../lib/http.js";
import { pickLocale, serializeRoomType } from "../lib/localization.js";
import { prisma } from "../lib/prisma.js";

const roomTypeParamsSchema = z.object({
  slug: z.string().min(1),
});

export async function registerRoomTypeRoutes(app: FastifyInstance) {
  app.get("/v1/room-types", async (request) => {
    const locale = pickLocale(request.headers["accept-language"]);
    const roomTypes = await prisma.roomType.findMany({
      orderBy: { capacity: "asc" },
    });

    return {
      roomTypes: roomTypes.map((roomType) => serializeRoomType(roomType, locale)),
    };
  });

  app.get("/v1/room-types/:slug", async (request, reply) => {
    const parsedParams = roomTypeParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      sendError(reply, 404, "ROOM_TYPE_NOT_FOUND", "Room type was not found.");
      return;
    }

    const locale = pickLocale(request.headers["accept-language"]);
    const roomType = await prisma.roomType.findUnique({
      where: { slug: parsedParams.data.slug },
    });

    if (!roomType) {
      sendError(reply, 404, "ROOM_TYPE_NOT_FOUND", "Room type was not found.");
      return;
    }

    return serializeRoomType(roomType, locale);
  });
}
