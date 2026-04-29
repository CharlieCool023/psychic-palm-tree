import * as cookie from "cookie";
import { verifyCustomSessionToken } from "./lib/custom-session";
import { findUserById } from "./queries/users";
import type { User } from "../contracts/types";

export const CustomSession = {
  cookieName: "nysc_sid",
  maxAgeMs: 7 * 24 * 60 * 60 * 1000,
} as const;

export async function authenticateCustomRequest(headers: Headers): Promise<User | null> {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[CustomSession.cookieName];
  if (!token) {
    return null;
  }
  const claim = await verifyCustomSessionToken(token);
  if (!claim) {
    return null;
  }
  const user = await findUserById(claim.userId);
  if (!user || !user.isActive || user.isDeleted) {
    return null;
  }
  return user;
}
