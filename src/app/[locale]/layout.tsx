import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { getLangDir } from "rtl-detect";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleTagManager } from "@next/third-parties/google";
/* import { AxiomWebVitals } from "next-axiom"; */

import "@/app/globals.css";
import TidioChat from "./tidio-chat";
import Script from "next/script";

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "600"] });

const GTM_ID = "GTM-TWX3CWJJ";

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
      {/*  <AxiomWebVitals /> */}

      {process.env.NODE_ENV === "production" && (
        <GoogleTagManager gtmId={GTM_ID} />
      )}
      {/* {process.env.NODE_ENV === "production" && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )} */}
      <body className={dmSans.className}>
        <Toaster />

        {children}

        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              ></iframe>
            </noscript>
          </>
        )}
        <TidioChat />
      </body>
    </html>
  );
}
