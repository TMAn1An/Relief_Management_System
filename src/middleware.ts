import { NextResponse, type NextRequest } from "next/server";

/** Cheap first gate: no session cookie → straight to login. Real verification happens in requireUser(). */
export function middleware(req: NextRequest) {
  if (!req.cookies.has("rms_session")) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
