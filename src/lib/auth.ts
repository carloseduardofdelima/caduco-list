import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "ps2_admin_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "ps2_fallback_super_secret_key_2025"
);

export async function createSession() {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    const verified = await jwtVerify(token, SECRET_KEY);
    return Boolean(verified.payload && verified.payload.role === "admin");
  } catch {
    return false;
  }
}
