import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTokenRoles, isTokenExpired } from "./lib/auth/jwt";

interface RoleRule {
  pattern: RegExp;
  roles: string[];
}

const ROLE_RULES: RoleRule[] = [
  { pattern: /^\/admin(?:\/|$)/i, roles: ["admin"] },
  { pattern: /^\/staff(?:\/|$)/i, roles: ["staff", "admin"] },
  { pattern: /^\/account(?:\/|$)/i, roles: ["customer", "staff", "admin"] },
];

const ACCESS_COOKIE_KEY = "auth.access";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const activeRule = ROLE_RULES.find((rule) => rule.pattern.test(pathname));
  if (!activeRule) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE_KEY)?.value ?? null;
  if (!accessToken || isTokenExpired(accessToken)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const roles = getTokenRoles(accessToken);
  const hasAccess =
    roles.length > 0 &&
    roles.some((role) => activeRule.roles.includes(role.toLowerCase()));

  if (!hasAccess) {
    const forbiddenUrl = new URL("/forbidden", request.url);
    return NextResponse.redirect(forbiddenUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/account/:path*"],
};
