import "dotenv/config";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { appRouter } from "../../api/router.js";

export default async function handler(req, res) {
  try {
    // Create TRPC caller
    const caller = appRouter.createCaller({
      req,
      resHeaders: res,
      user: null,
    });

    // Extract the procedure path from the query
    const { trpc } = req.query;
    if (!trpc) {
      return res.status(400).json({ error: "Missing TRPC procedure" });
    }

    // Handle different procedures
    if (trpc === "customAuth.login") {
      const { input } = req.body || {};
      if (!input) {
        return res.status(400).json({ error: "Missing input" });
      }

      const result = await caller.customAuth.login(input);
      return res.status(200).json({ result });
    }

    if (trpc === "ping") {
      const result = await caller.ping();
      return res.status(200).json({ result });
    }

    return res.status(404).json({ error: "Procedure not found" });

  } catch (error) {
    console.error("TRPC Error:", error);
    return res.status(500).json({ error: error.message });
  }
}