import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { prisma } from "./lib/prisma.js";
import { sendError } from "./lib/http.js";
import { registerAvailabilityRoutes } from "./routes/availability.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerRoomTypeRoutes } from "./routes/room-types.js";

export function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  app.register(sensible);
  app.register(registerRoomTypeRoutes);
  app.register(registerAvailabilityRoutes);
  app.register(registerReservationRoutes);

  app.get("/v1/healthz", async () => ({ status: "ok" }));

  app.get("/v1/readyz", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok" };
    } catch {
      sendError(reply, 503, "DATABASE_UNAVAILABLE", "Database connection is not ready.");
    }
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    const code = statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED";
    const message = statusCode >= 500 ? "Internal server error." : error.message;

    sendError(reply, statusCode, code, message);
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
