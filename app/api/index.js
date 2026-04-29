import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../api/router.js";

const app = new Hono();

app.use("*", cors({
  origin: [
    "https://nyscondocamp.web.app",
    "https://nyscondocamp.firebaseapp.com",
    "http://localhost:3000",
    "http://localhost:5000",
  ],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }));

app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({
      req: c.req.raw,
      resHeaders: c.res.headers,
      user: null,
    }),
  });
});

export default app;