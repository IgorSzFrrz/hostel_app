import { describe, expect, it } from "vitest";
import { reservationCodeSchema } from "@hostel/shared";
import { generateReservationCode } from "../src/lib/reservation-code.js";
import { buildServer } from "../src/server.js";

const ORIGINAL_CORS_ORIGINS = process.env.CORS_ORIGINS;
const ORIGINAL_TRUST_PROXY = process.env.TRUST_PROXY;

async function withCorsOrigins(corsOrigins: string | undefined, run: () => Promise<void>) {
  if (corsOrigins === undefined) {
    delete process.env.CORS_ORIGINS;
  } else {
    process.env.CORS_ORIGINS = corsOrigins;
  }

  try {
    await run();
  } finally {
    if (ORIGINAL_CORS_ORIGINS === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = ORIGINAL_CORS_ORIGINS;
    }
  }
}

async function withTrustProxy(trustProxy: string | undefined, run: () => Promise<void>) {
  if (trustProxy === undefined) {
    delete process.env.TRUST_PROXY;
  } else {
    process.env.TRUST_PROXY = trustProxy;
  }

  try {
    await run();
  } finally {
    if (ORIGINAL_TRUST_PROXY === undefined) {
      delete process.env.TRUST_PROXY;
    } else {
      process.env.TRUST_PROXY = ORIGINAL_TRUST_PROXY;
    }
  }
}

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

  it("allows configured browser origins", async () => {
    await withCorsOrigins("https://web.example,http://localhost:5173", async () => {
      const app = buildServer();

      try {
        const response = await app.inject({
          method: "GET",
          url: "/v1/healthz",
          headers: {
            Origin: "https://web.example",
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["access-control-allow-origin"]).toBe("https://web.example");
        expect(response.headers["access-control-allow-methods"]).toBe("GET,POST,OPTIONS");
        expect(response.headers["access-control-allow-headers"]).toBe(
          "Accept,Accept-Language,Content-Type",
        );
        expect(response.headers.vary).toBe("Origin");
      } finally {
        await app.close();
      }
    });
  });

  it("does not allow unconfigured browser origins", async () => {
    await withCorsOrigins("https://web.example", async () => {
      const app = buildServer();

      try {
        const response = await app.inject({
          method: "GET",
          url: "/v1/healthz",
          headers: {
            Origin: "https://other.example",
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["access-control-allow-origin"]).toBeUndefined();
      } finally {
        await app.close();
      }
    });
  });

  it("answers CORS preflight requests for configured origins", async () => {
    await withCorsOrigins("https://web.example", async () => {
      const app = buildServer();

      try {
        const response = await app.inject({
          method: "OPTIONS",
          url: "/v1/reservations",
          headers: {
            "Access-Control-Request-Headers": "Content-Type",
            "Access-Control-Request-Method": "POST",
            Origin: "https://web.example",
          },
        });

        expect(response.statusCode).toBe(204);
        expect(response.body).toBe("");
        expect(response.headers["access-control-allow-origin"]).toBe("https://web.example");
        expect(response.headers["access-control-max-age"]).toBe("86400");
      } finally {
        await app.close();
      }
    });
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

  it("keeps proxied client rate limits separate when trusted proxy mode is enabled", async () => {
    await withTrustProxy("true", async () => {
      const app = buildServer();

      try {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const response = await app.inject({
            method: "POST",
            url: "/v1/reservations",
            headers: {
              "x-forwarded-for": "203.0.113.20",
            },
            payload: {},
            remoteAddress: "10.0.0.10",
          });

          expect(response.statusCode).toBe(400);
        }

        const differentClientResponse = await app.inject({
          method: "POST",
          url: "/v1/reservations",
          headers: {
            "x-forwarded-for": "203.0.113.21",
          },
          payload: {},
          remoteAddress: "10.0.0.10",
        });

        expect(differentClientResponse.statusCode).toBe(400);
      } finally {
        await app.close();
      }
    });
  });

  it("does not trust forwarded client IPs unless explicitly configured", async () => {
    await withTrustProxy(undefined, async () => {
      const app = buildServer();

      try {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const response = await app.inject({
            method: "POST",
            url: "/v1/reservations",
            headers: {
              "x-forwarded-for": "203.0.113.30",
            },
            payload: {},
            remoteAddress: "10.0.0.20",
          });

          expect(response.statusCode).toBe(400);
        }

        const sameProxyResponse = await app.inject({
          method: "POST",
          url: "/v1/reservations",
          headers: {
            "x-forwarded-for": "203.0.113.31",
          },
          payload: {},
          remoteAddress: "10.0.0.20",
        });

        expect(sameProxyResponse.statusCode).toBe(429);
      } finally {
        await app.close();
      }
    });
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
