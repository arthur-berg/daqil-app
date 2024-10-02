import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { locales } from "@/lib/config";
import { cookies } from "next/headers";

const { auth } = NextAuth(authConfig);

import { DEFAULT_LOGIN_REDIRECT, publicRoutes, authRoutes } from "@/routes";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
});

const clearCookies = (res: NextResponse) => {
  res.cookies.set("session", "", { maxAge: 0 });
  res.cookies.set("anotherCookie", "", { maxAge: 0 }); // Add any other cookies you need to clear
  return res;
};

const authMiddleware = auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  /*  if (req.headers.get("status") === "431") {
    return clearCookies(req);
  } */

  const pathnameParts = nextUrl.pathname.split("/");
  const locale = (
    locales.includes(pathnameParts[1] as any) ? pathnameParts[1] : "ar"
  ) as (typeof locales)[number];

  const pathWithoutLocale = locales.includes(pathnameParts[1] as any)
    ? `/${pathnameParts.slice(2).join("/")}`
    : nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(pathWithoutLocale);
  const isAuthRoute = authRoutes.includes(pathWithoutLocale);

  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (isApiRoute) {
    // Skip locale handling for API routes

    return;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(
        new URL(`/${locale}/${DEFAULT_LOGIN_REDIRECT}`, nextUrl)
      );
    }
    return intlMiddleware(req);
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    // TODO , fix this , now we need to set redirectTo in signOut to make it work
    return Response.redirect(
      new URL(
        `/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`,
        nextUrl
      )
    );

    /*  if (!callbackUrl.startsWith(`/${locale}/auth/login`)) {
      return Response.redirect(
        new URL(
          `/${locale}/auth/login?callbackUrl=${encodedCallbackUrl}`,
          nextUrl
        )
      );
    } */
  }

  if (isLoggedIn) {
    return intlMiddleware(req); // Apply internationalization for logged-in users
  }

  return intlMiddleware(req);
});

export default function middleware(req: NextRequest) {
  const pathnameParts = req.nextUrl.pathname.split("/");

  const pathWithoutLocale = locales.includes(pathnameParts[1] as any)
    ? `/${pathnameParts.slice(2).join("/")}`
    : req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(pathWithoutLocale);

  if (req.headers.get("status") === "431") {
    const res = NextResponse.next();
    return clearCookies(res);
  }

  if (isPublicRoute) {
    return intlMiddleware(req); // Apply internationalization for public pages
  } else {
    return (authMiddleware as any)(req); // Apply authentication logic for non-public pages
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
