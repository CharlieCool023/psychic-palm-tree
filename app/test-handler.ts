import { handle } from "hono/vercel";
import app from "./src/api/boot";

const handler = handle(app);

const req = {
  method: "GET",
  url: "/api/health",
  headers: { host: "localhost:3000" }
};
const res = {
  setHeader: console.log,
  statusCode: 200,
  end: (data) => console.log("Response:", data)
};

handler(req as any, res as any).catch(console.error);
