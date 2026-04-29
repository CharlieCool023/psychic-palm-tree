import "dotenv/config";
import express from "express";
import cors from "cors";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { appRouter } from "./router.js";
import superjson from "superjson";

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "https://nyscondocamp.web.app",
    "https://nyscondocamp.firebaseapp.com",
    "http://localhost:3000",
    "http://localhost:5000",
  ],
  credentials: true,
}));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// TRPC handler
app.use("/api/trpc/*", async (req, res) => {
  try {
    // Create TRPC caller
    const caller = appRouter.createCaller({
      req,
      res,
      user: null, // We'll handle auth separately
    });

    // Extract the procedure path from the URL
    const path = req.url.replace("/api/trpc/", "").split("?")[0];

    if (path === "ping") {
      const result = await caller.ping();
      res.json({ result: { data: result } });
      return;
    }

    // For other endpoints, return a simple response for now
    res.json({ error: "Endpoint not implemented" });
  } catch (error) {
    console.error("TRPC Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});