import authConfig from "@/auth.config";
import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { locales } from "@/lib/config";

const { auth } = NextAuth(authConfig);

import {
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  apiAuthPrefix,
  authRoutes,
} from "@/routes";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "en",
});

const authMiddleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const pathnameParts = nextUrl.pathname.split("/");
  const locale = (
    locales.includes(pathnameParts[1] as any) ? pathnameParts[1] : "en"
  ) as (typeof locales)[number];
  console.log("locale", locale);
  const pathWithoutLocale = locales.includes(pathnameParts[1] as any)
    ? `/${pathnameParts.slice(2).join("/")}`
    : nextUrl.pathname;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(pathWithoutLocale);
  const isAuthRoute = authRoutes.includes(pathWithoutLocale);

  if (isApiAuthRoute) {
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
