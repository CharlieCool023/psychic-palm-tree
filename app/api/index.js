import "dotenv/config";

export default function handler(req, res) {
  // Simple health check
  if (req.url === "/api/health" && req.method === "GET") {
    res.status(200).json({ ok: true, ts: Date.now() });
    return;
  }

  // Simple TRPC ping
  if (req.url?.startsWith("/api/trpc/ping") && req.method === "GET") {
    res.status(200).json({
      result: {
        data: { ok: true, ts: Date.now() }
      }
    });
    return;
  }

  // Default response
  res.status(404).json({ error: "Not found" });
}