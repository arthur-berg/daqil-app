import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { locales } from "@/lib/config";
/* import { encode } from "next-auth/jwt"; */

const { auth } = NextAuth(authConfig);

import { DEFAULT_LOGIN_REDIRECT, publicRoutes, authRoutes } from "@/routes";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "ar",
});

const authMiddleware = auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  /*   const cookiesList = req.cookies.getAll();
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith("https://")
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token"; */

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

  // no session token present, remove all next-auth cookies and redirect to sign-in
  /* if (!cookiesList.some((cookie) => cookie.name.includes(sessionCookie))) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/auth/login`, req.url)
    );

    req.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("next-auth"))
        response.cookies.delete(cookie.name);
    });

    return response;
  } */

  // session token present, check if it's valid
  /* const session = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
    headers: {
      "content-type": "application/json",
      cookie: req.cookies.toString(),
    },
  } satisfies RequestInit);
  const json = await session.json();
  const data = Object.keys(json).length > 0 ? json : null; */

  // session token is invalid, remove all next-auth cookies and redirect to sign-in
  /* if (!session.ok || !data?.user) {
    const response = NextResponse.redirect(
      new URL(`/${locale}/auth/login`, req.url)
    );

    req.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("next-auth"))
        response.cookies.delete(cookie.name);
    });

    return response;
  } */

  // session token is valid so we can continue
  /* const newAccessToken = await fetch("path/to/custom/backend"); 
  const response = NextResponse.next();
  const newSessionToken = await encode({
    secret: process.env.NEXTAUTH_SECRET,
    token: {
      accessToken: newAccessToken,
    },
    maxAge: 30 * 24 * 60 * 60, 
  }); */

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

  if (isPublicRoute) {
    return intlMiddleware(req); // Apply internationalization for public pages
  } else {
    return (authMiddleware as any)(req); // Apply authentication logic for non-public pages
  }
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
