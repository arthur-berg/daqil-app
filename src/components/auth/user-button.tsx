"use client";

import { FaUser } from "react-icons/fa";
import { ExitIcon, GearIcon, CardStackIcon } from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LogoutButton } from "@/components/auth/logout-button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";

export const UserButton = () => {
  const user = useCurrentUser();
  const t = useTranslations("ProfileAvatarDropdown");

  const canAccessAppointments =
    user?.role === "THERAPIST" || user?.role === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-background">
            <FaUser />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <div className="px-2 py-1 text-xs font-semibold text-gray-500">
          {t("forTherapists")}
        </div>
        {canAccessAppointments ? (
          <Link href={"/appointments"}>
            <DropdownMenuItem>
              <CardStackIcon className="h-4 w-4 mr-2" />
              {t("createAppointments")}
            </DropdownMenuItem>
          </Link>
        ) : (
          <DropdownMenuItem className="opacity-50 cursor-not-allowed">
            <CardStackIcon className="h-4 w-4 mr-2" />
            {t("appointments")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs font-semibold text-gray-500">
          {t("forClients")}
        </div>
        <Link href="/therapists">
          <DropdownMenuItem>
            <CardStackIcon className="h-4 w-4 mr-2" />
            {t("bookSession")}
          </DropdownMenuItem>
        </Link>
        <Link href="/pricing">
          <DropdownMenuItem>
            <CardStackIcon className="h-4 w-4 mr-2" />
            {t("payment")}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs font-semibold text-gray-500">
          {t("forAllUsers")}
        </div>

        <Link href="/settings">
          <DropdownMenuItem>
            <GearIcon className="h-4 w-4 mr-2" />
            {t("settings")}
          </DropdownMenuItem>
        </Link>
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            {t("logout")}
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
