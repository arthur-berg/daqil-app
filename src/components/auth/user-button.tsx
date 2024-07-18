"use client";

import { FaUser } from "react-icons/fa";
import {
  ExitIcon,
  GearIcon,
  CardStackIcon,
  CalendarIcon,
  DashboardIcon,
} from "@radix-ui/react-icons";

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

const TherapistMenu = ({ t }: { t: any }) => {
  return (
    <>
      <Link href={"/therapist/availability"}>
        <DropdownMenuItem>
          <CalendarIcon className="h-4 w-4 mr-2" />
          {t("availability")}
        </DropdownMenuItem>
      </Link>
      <Link href={"/therapist/appointments"}>
        <DropdownMenuItem>
          <CardStackIcon className="h-4 w-4 mr-2" />
          {t("appointments")}
        </DropdownMenuItem>
      </Link>
    </>
  );
};

const ClientMenu = ({ t }: { t: any }) => {
  return (
    <>
      <Link href="/client/appointments">
        <DropdownMenuItem>
          <CardStackIcon className="h-4 w-4 mr-2" />
          {t("appointments")}
        </DropdownMenuItem>
      </Link>
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
    </>
  );
};

export const UserButton = () => {
  const user = useCurrentUser();
  const t = useTranslations("ProfileAvatarDropdown");

  const isTherapist = user?.role === "THERAPIST";
  const isClient = user?.role === "CLIENT";
  const isAdmin = user?.role === "ADMIN";

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
      <DropdownMenuContent align="end">
        <div className="px-4 py-2 text-sm text-gray-700 text-center">
          {user?.firstName} {user?.lastName} <br />
          <span className="text-xs text-gray-500">{user?.role}</span>
          <DropdownMenuSeparator />
        </div>

        {isTherapist ? (
          <TherapistMenu t={t} />
        ) : isClient ? (
          <ClientMenu t={t} />
        ) : isAdmin ? (
          <Link href="/admin">
            <DropdownMenuItem>
              <DashboardIcon className="h-4 w-4 mr-2" />
              {t("admin")}
            </DropdownMenuItem>
          </Link>
        ) : null}
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
