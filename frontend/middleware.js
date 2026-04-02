import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isLandlordRoute = nextUrl.pathname.startsWith("/landlord");
  const isTenantRoute = nextUrl.pathname.startsWith("/tenant");

  // 1. Redirect logged-in users away from auth routes to their dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(`/${userRole}/dashboard`, nextUrl));
    }
    return null;
  }

  // 2. Protect Role-Specific Routes
  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL(isLoggedIn ? `/${userRole}/dashboard` : "/login", nextUrl));
  }

  if (isLandlordRoute && userRole !== "landlord" && userRole !== "admin") {
    return NextResponse.redirect(new URL(isLoggedIn ? `/${userRole}/dashboard` : "/login", nextUrl));
  }

  if (isTenantRoute && userRole !== "tenant" && userRole !== "admin") {
    return NextResponse.redirect(new URL(isLoggedIn ? `/${userRole}/dashboard` : "/login", nextUrl));
  }

  // 3. Fallback for unauthenticated users on protected routes
  if (!isLoggedIn && (isAdminRoute || isLandlordRoute || isTenantRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return null;
});

// Configure middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
