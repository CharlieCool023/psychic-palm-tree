// Vercel Serverless Function - Single entry point for all API routes
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Health endpoint
  if (pathname === "/api/health" && req.method === "GET") {
    res.status(200).json({ ok: true, ts: Date.now() });
    return;
  }

  // TRPC handler - single endpoint for all tRPC procedures
  if (pathname === "/api/trpc" || pathname.startsWith("/api/trpc/")) {
    try {
      const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: req,
        router: appRouter,
        createContext,
      });

      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== "transfer-encoding") {
          res.setHeader(key, value);
        }
      });

      const text = await response.text();
      try {
        res.json(JSON.parse(text));
      } catch {
        res.send(text);
      }
      return;
    } catch (error) {
      console.error("TRPC Error:", error);
      res.status(500).json({ error: { message: "Internal server error" } });
      return;
    }
  }

  // Default 404
  res.status(404).json({ error: "Not found" });
}