import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "../contracts/types";
import { authenticateCustomRequest } from "./custom-auth";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const user = await authenticateCustomRequest(opts.req.headers);
    if (user) {
      ctx.user = user;
    }
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
