import {
  GearIcon,
  CardStackIcon,
  CalendarIcon,
  DashboardIcon,
  PersonIcon,
} from "@radix-ui/react-icons";

import { MdGroup } from "react-icons/md";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: React.ElementType;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export const getAdmintMenuList = (pathname: string, t: any): Group[] => {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/admin",
          label: t("admin"),
          active: pathname.includes("/admin"),
          icon: DashboardIcon,
          submenus: [],
        },
        {
          href: "/settings",
          label: t("settings"),
          active: pathname.includes("/settings"),
          icon: GearIcon,
          submenus: [],
        },
        /* {
          href: "/logout",
          label: t("logout"),
          active: pathname.includes("/logout"),
          icon: GearIcon,
          submenus: [],
        }, */
      ],
    },
  ];
};

export const getClientMenuList = (pathname: string, t: any): Group[] => {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/client/appointments",
          label: t("appointments"),
          active: pathname.includes("/client/appointments"),
          icon: CardStackIcon,
          submenus: [],
        },
        {
          href: "/book-appointment",
          label: t("bookSession"),
          active: pathname.includes("/book-appointment"),
          icon: CardStackIcon,
          submenus: [],
        },
        {
          href: "/pricing",
          label: t("payment"),
          active: pathname.includes("/pricing"),
          icon: CardStackIcon,
          submenus: [],
        },
        {
          href: "/settings",
          label: t("settings"),
          active: pathname.includes("/settings"),
          icon: GearIcon,
          submenus: [],
        },
        /* {
          href: "/logout",
          label: t("logout"),
          active: pathname.includes("/logout"),
          icon: GearIcon,
          submenus: [],
        }, */
      ],
    },
  ];
};

export const getTherapistMenuList = (pathname: string, t: any): Group[] => {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/therapist/appointments",
          label: t("appointments"),
          active: pathname.includes("/therapist/appointments"),
          icon: CardStackIcon,
          submenus: [],
        },
        {
          href: "/therapist/my-clients",
          label: t("myClients"),
          active: pathname.includes("/therapist/my-clients"),
          icon: MdGroup,
          submenus: [],
        },
        {
          href: "/therapist/availability",
          label: t("availability"),
          active: pathname.includes("/therapist/availability"),
          icon: CalendarIcon,
          submenus: [],
        },
        {
          href: "/therapist/my-profile",
          label: t("myProfile"),
          active: pathname.includes("/therapist/my-profile"),
          icon: PersonIcon,
          submenus: [],
        },
        {
          href: "/settings",
          label: t("settings"),
          active: pathname.includes("/settings"),
          icon: GearIcon,
          submenus: [],
        },
        /* {
          href: "/logout",
          label: t("logout"),
          active: pathname.includes("/logout"),
          icon: GearIcon,
          submenus: [],
        }, */
      ],
    },
  ];
};
