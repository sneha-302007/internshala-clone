import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const mobileBlocked = request.cookies.get("mobile_blocked")?.value;
  const otpPending = request.cookies.get("otp_pending")?.value;
  const otpVerified = request.cookies.get("otp_verified")?.value;

  console.log("MIDDLEWARE:", pathname);

  // 🚫 Block mobile users globally
  if (mobileBlocked && !pathname.startsWith("/userlogin")) {
    return NextResponse.redirect(new URL("/userlogin", request.url));
  }

  // allow auth pages
  if (
    pathname.startsWith("/otp") ||
    pathname.startsWith("/userlogin") ||
    pathname.startsWith("/usersignup")
  ) {
    return NextResponse.next();
  }

  // 🔐 OTP enforcement
  if (otpPending && !otpVerified) {
    return NextResponse.redirect(new URL("/otp", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/internship/:path*",
    "/job/:path*",
    "/profile/:path*",
    "/userapplication/:path*",
    "/community/:path*",
    "/loginHistory/:path*",
  ],
};
