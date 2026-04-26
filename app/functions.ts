import "dotenv/config";
import { onRequest } from "firebase-functions/v2/https";
import app from "./api/boot.js";

export const api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    minInstances: 0,
    concurrency: 80,
  },
  async (req, res) => {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || req.hostname;
    const url = `${proto}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }

    let body: Buffer | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await new Promise<Buffer>((resolve) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
      });
    }

    const fetchReq = new Request(url, {
      method: req.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
    });

    const fetchRes = await app.fetch(fetchReq);

    res.status(fetchRes.status);
    fetchRes.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding") {
        res.setHeader(key, value);
      }
    });

    const responseBody = await fetchRes.arrayBuffer();
    res.end(Buffer.from(responseBody));
  }
);
