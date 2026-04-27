import Fastify from "fastify";

export function buildServer() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  app.get("/v1/healthz", async () => ({ status: "ok" }));

  return app;
}
