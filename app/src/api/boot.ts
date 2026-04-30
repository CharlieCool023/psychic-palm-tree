import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("/api/*", cors({
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

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.get("/api/health", (c) => c.json({ ok: true }));

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;


