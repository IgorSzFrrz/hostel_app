import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { createRateLimiter } from "./lib/rate-limit.js";
import { prisma } from "./lib/prisma.js";
import { sendError } from "./lib/http.js";
import { registerAvailabilityRoutes } from "./routes/availability.js";
import { registerReservationRoutes } from "./routes/reservations.js";
import { registerRoomTypeRoutes } from "./routes/room-types.js";

const CORS_ALLOW_METHODS = "GET,POST,OPTIONS";
const CORS_ALLOW_HEADERS = "Accept,Accept-Language,Content-Type";
const CORS_MAX_AGE_SECONDS = 86_400;

function parseCorsOrigins(value: string | undefined): string[] {
  return (
    value
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  );
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isCorsOriginAllowed(origin: string, allowedOrigins: readonly string[]): boolean {
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}

export function buildServer() {
  const app = Fastify({
    bodyLimit: 64 * 1024,
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
    trustProxy: process.env.TRUST_PROXY === "true",
  });
  const rateLimiter = createRateLimiter();
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGINS);

  app.addHook("onRequest", async (request, reply) => {
    reply.header("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
    reply.header("Cross-Origin-Opener-Policy", "same-origin");
    reply.header("Cross-Origin-Resource-Policy", "same-origin");
    reply.header("Permissions-Policy", "camera=(), geolocation=(), microphone=(), payment=()");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");

    const origin = getHeaderValue(request.headers.origin);
    if (origin && isCorsOriginAllowed(origin, corsOrigins)) {
      reply.header("Access-Control-Allow-Origin", corsOrigins.includes("*") ? "*" : origin);
      reply.header("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
      reply.header("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
      reply.header("Access-Control-Max-Age", CORS_MAX_AGE_SECONDS.toString());
      reply.header("Vary", "Origin");
    }

    if (request.method === "OPTIONS") {
      return reply.code(204).send();
    }
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
