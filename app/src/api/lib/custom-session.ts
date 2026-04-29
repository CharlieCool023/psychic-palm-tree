import * as jose from "jose";
import { env } from "./env";

export interface CustomSessionPayload {
  userId: string;
  username: string;
  role: string;
}

const JWT_ALG = "HS256";
const secret = new TextEncoder().encode(env.appSecret);

export async function signCustomSessionToken(
  payload: CustomSessionPayload
): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyCustomSessionToken(
  token: string
): Promise<CustomSessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      clockTolerance: 60,
    });
    const { userId, username, role } = payload;
    if (!userId || !username || !role) {
      return null;
    }
    return { userId: userId as string, username: username as string, role: role as string };
  } catch {
    return null;
  }
}
