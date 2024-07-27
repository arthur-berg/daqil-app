"use client";

import { logout } from "@/actions/logout";
import React from "react";

type LogoutButtonProps = {
  children?: React.ReactNode;
};

export const LogoutButton = React.forwardRef<
  HTMLSpanElement,
  LogoutButtonProps
>(({ children }, ref) => {
  const onClick = () => {
    logout();
  };

  return (
    <span onClick={onClick} ref={ref} className="cursor-pointer">
      {children}
    </span>
  );
});

LogoutButton.displayName = "LogoutButton";
