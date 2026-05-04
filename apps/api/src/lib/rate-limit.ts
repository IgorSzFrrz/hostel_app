import type { FastifyReply, FastifyRequest } from "fastify";
import { sendError } from "./http.js";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitRule = {
  max: number;
  scope: string;
  windowMs: number;
};

export function createRateLimiter(now = () => Date.now()) {
  const buckets = new Map<string, RateLimitBucket>();

  function cleanupExpiredBuckets(currentTime: number) {
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= currentTime) {
        buckets.delete(key);
      }
    }
  }

  function consume(request: FastifyRequest, reply: FastifyReply, rule: RateLimitRule): boolean {
    const currentTime = now();
    if (buckets.size > 10_000) {
      cleanupExpiredBuckets(currentTime);
    }

    const key = `${rule.scope}:${request.ip}`;
    const existingBucket = buckets.get(key);
    const bucket =
      existingBucket && existingBucket.resetAt > currentTime
        ? existingBucket
        : { count: 0, resetAt: currentTime + rule.windowMs };

    if (bucket.count >= rule.max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1000));

      reply.header("Retry-After", String(retryAfterSeconds));
      sendError(reply, 429, "RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.");
      return false;
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return true;
  }

  return { consume };
}
