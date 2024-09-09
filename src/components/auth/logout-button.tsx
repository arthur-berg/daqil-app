"use client";

import { logout } from "@/actions/logout";
import { useTranslations } from "next-intl";
import React, { useTransition } from "react";
import { BeatLoader } from "react-spinners";

type LogoutButtonProps = {
  children?: React.ReactNode;
};

export const LogoutButton = React.forwardRef<
  HTMLSpanElement,
  LogoutButtonProps
>(({ children }, ref) => {
  const [isPending, startTransition] = useTransition();
  const onClick = () => {
    startTransition(() => {
      logout();
    });
  };
  const t = useTranslations("LogoutButton");

  return isPending ? (
    <div className="flex items-center flex-col space-x-2">
      <BeatLoader size={8} color="#36D7B7" />
      <div>{t("loggingYouOut")}</div>
    </div>
  ) : (
    <span onClick={onClick} ref={ref} className="cursor-pointer">
      {children}
    </span>
  );
});

LogoutButton.displayName = "LogoutButton";
