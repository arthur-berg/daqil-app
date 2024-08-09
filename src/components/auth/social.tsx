"use client";

import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export const Social = () => {
  const t = useTranslations("AuthPage");
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const locale = useLocale();

  const onClick = (provider: "google" | "github") => {
    // TODO ADD LOCALE BEFORE DEFAULT_LOGIN_REDIRECT
    signIn(provider, {
      callbackUrl: callbackUrl || `/${locale}/${DEFAULT_LOGIN_REDIRECT}`,
    });
  };

  return (
    <div className="flex flex-col items-center w-full gap-y-2">
      <Button
        size="lg"
        className="flex justify-start w-full"
        variant="secondary"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5 mr-4" />{" "}
        <span>{t("continueWithGoogle")}</span>
      </Button>
      {/*  <Button
        size="lg"
        className="flex justify-start w-full"
        variant="secondary"
        onClick={() => {}}
      >
        <FaMicrosoft className="h-5 w-5 mr-4" />{" "}
        <span>Continue with Microsoft Account</span>
      </Button> */}
    </div>
  );
};
