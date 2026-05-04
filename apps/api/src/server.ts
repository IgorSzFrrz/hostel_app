import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { createRateLimiter } from "./lib/rate-limit.js";
import { prisma } from "./lib/prisma.js";
import { sendError } from "./lib/http.js";
import { registerAvailabilityRoutes } from "./routes/availability.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerRoomTypeRoutes } from "./routes/room-types.js";

export function buildServer() {
  const app = Fastify({
    bodyLimit: 64 * 1024,
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });
  const rateLimiter = createRateLimiter();

  app.addHook("onRequest", async (_request, reply) => {
    reply.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    reply.header("Cross-Origin-Opener-Policy", "same-origin");
    reply.header("Cross-Origin-Resource-Policy", "same-origin");
    reply.header("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=()");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
  });

  app.register(sensible);
  app.register(registerRoomTypeRoutes);
  app.register(registerAvailabilityRoutes);
  app.register(registerReservationRoutes, { rateLimiter });

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

    const errorStatusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof error.statusCode === "number"
        ? error.statusCode
        : undefined;
    const statusCode = errorStatusCode && errorStatusCode >= 400 ? errorStatusCode : 500;
    const code = statusCode >= 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_FAILED";
    const message =
      statusCode >= 500
        ? "Internal server error."
        : error instanceof Error
          ? error.message
          : "Request failed.";

    sendError(reply, statusCode, code, message);
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
