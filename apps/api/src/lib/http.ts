import type { FastifyReply } from "fastify";
import type { ZodError } from "zod";

export function sendValidationError(reply: FastifyReply, error: ZodError) {
  return reply.code(400).send({
    error: {
      code: "VALIDATION_FAILED",
      message: "Request validation failed.",
      details: error.issues,
    },
  });
}

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
) {
  return reply.code(statusCode).send({
    error: {
      code,
      message,
      details,
    },
  });
}
