import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from "@next/third-parties/google";

import "@/app/globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Daqil",
  description: "Daqil - Easy and affordable online therapy",
  icons: {
    icon: "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: "no",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const direction = getLangDir(locale);

  return (
    <html lang={locale} dir={direction}>
      {process.env.NODE_ENV === "production" && (
        <GoogleTagManager gtmId="GTM-WWNR5RVB" />
      )}
      <body className={dmSans.className}>
        <Toaster />

        {children}
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
