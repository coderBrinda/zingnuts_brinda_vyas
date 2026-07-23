import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/unauthorized"];

const ROLE_ROUTES = {
  "/projects/new": ["admin", "pm"],
  "/users": ["admin"],
};

function getRequiredRoles(pathname) {
  if (/^\/projects\/[^/]+\/edit$/.test(pathname)) {
    return ["admin", "pm"];
  }

  for (const [route, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return roles;
    }
  }
  return null;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const token = request.cookies.get("pm_token")?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const requiredRoles = getRequiredRoles(pathname);
  if (requiredRoles && token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString()
      );
      if (!requiredRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
