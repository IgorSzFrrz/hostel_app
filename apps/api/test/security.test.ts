import { describe, expect, it } from "vitest";
import { reservationCodeSchema } from "@hostel/shared";
import { generateReservationCode } from "../src/lib/reservation-code.js";
import { buildServer } from "../src/server.js";

describe("API security controls", () => {
  it("sets defensive headers on API responses", async () => {
    const app = buildServer();

    try {
      const response = await app.inject({ method: "GET", url: "/v1/healthz" });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-security-policy"]).toBe(
        "default-src 'none'; frame-ancestors 'none'",
      );
      expect(response.headers["referrer-policy"]).toBe("no-referrer");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-frame-options"]).toBe("DENY");
    } finally {
      await app.close();
    }
  });

  it("rate limits reservation creation attempts before database access", async () => {
    const app = buildServer();

    try {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const response = await app.inject({
          method: "POST",
          url: "/v1/reservations",
          payload: {},
          remoteAddress: "203.0.113.10",
        });

        expect(response.statusCode).toBe(400);
      }

      const blockedResponse = await app.inject({
        method: "POST",
        url: "/v1/reservations",
        payload: {},
        remoteAddress: "203.0.113.10",
      });

      expect(blockedResponse.statusCode).toBe(429);
      expect(blockedResponse.headers["retry-after"]).toBeDefined();
    } finally {
      await app.close();
    }
  });

  it("does not expose reservation email lookups through query strings", async () => {
    const app = buildServer();

    try {
      const response = await app.inject({
        method: "GET",
        url: "/v1/reservations/HST-23456789?email=guest@example.com",
      });

      expect(response.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });
});

describe("reservation code entropy", () => {
  it("generates codes accepted by the shared schema", () => {
    expect(reservationCodeSchema.parse(generateReservationCode())).toMatch(
      /^HST-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/,
    );
  });

  it("rejects legacy short codes", () => {
    expect(reservationCodeSchema.safeParse("HST-ABCDE").success).toBe(false);
  });
});
