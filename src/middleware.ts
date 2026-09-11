import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "ps2_admin_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "ps2_fallback_super_secret_key_2025"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger todas as rotas /admin, exceto /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
