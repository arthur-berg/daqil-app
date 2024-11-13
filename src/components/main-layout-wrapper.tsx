"use client";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "@/navigation";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { useMediaQuery } from "react-responsive";
import { useCurrentUser } from "@/hooks/use-current-user";
import { logout } from "@/actions/logout";
import Cookies from "js-cookie";

import TimezoneWarningDialog from "@/components/timezone-warning-dialog";
import { updateUserCampaignId } from "@/actions/update-user-campaign-id";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { updateUserUTMData } from "@/actions/update-user-utm-data";
import { useSearchParams } from "next/navigation";

const routesWithoutSidebar = ["/appointments/[id]"];

function matchesPath(pathname: string, routePattern: string) {
  // Exclude specific routes like "/appointments/ended"
  const excludedRoutes = ["/appointments/ended"];
  if (excludedRoutes.includes(pathname)) {
    return false;
  }

  // Proceed with matching dynamic routes
  const regexPattern = new RegExp(`^${routePattern.replace("[id]", "[^/]+")}$`);
  return regexPattern.test(pathname);
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTimezoneDialog, setShowTimezoneDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();

  const pathname = usePathname();
  const sidebarMenuRef = useRef<any>();
  const user = useCurrentUser();

  const shouldRenderWithoutSidebar = routesWithoutSidebar.some((route) =>
    matchesPath(pathname, route)
  );

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userTimeZone = user?.settings?.timeZone || "UTC";

  const areTimeZonesEquivalent = (tz1: string, tz2: string) => {
    const datesToCheck = [
      new Date(),
      new Date(Date.UTC(2024, 0, 1)),
      new Date(Date.UTC(2024, 6, 1)),
    ];

    const getOffset = (date: Date, timeZone: string) => {
      try {
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone,
          timeZoneName: "shortOffset",
        });
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find((part) => part.type === "timeZoneName");

        if (offsetPart) {
          const match = offsetPart.value.match(
            /(?:UTC|GMT)([+-]\d{1,2})(?::(\d{2}))?/
          );
          if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = match[2] ? parseInt(match[2], 10) : 0;
            return hours * 60 + minutes;
          }
        }
      } catch (error) {
        console.error("Error calculating offset:", error);
      }
      return NaN;
    };

    return datesToCheck.every((date) => {
      const offset1 = getOffset(date, tz1);
      const offset2 = getOffset(date, tz2);

      return offset1 === offset2;
    });
  };

  const timeZoneMismatch = !areTimeZonesEquivalent(
    browserTimeZone,
    userTimeZone
  );

  /*   useEffect(() => {
    const googleCampaignId = Cookies.get("gclid");
    const metaCampaignId = Cookies.get("fbclid");

    if (
      user &&
      !user.marketingCampaignId &&
      (googleCampaignId || metaCampaignId)
    ) {
      const campaignId = googleCampaignId || metaCampaignId;
      startTransition(async () => {
        await updateUserCampaignId(user.id, campaignId as string);
      });
    }
  }, [user]); */

  useEffect(() => {
    const dismissedTimeZoneCookie = Cookies.get("timezoneWarningDismissed");
    let dismissedTimezoneChanged = false;
    if (dismissedTimeZoneCookie) {
      const formattedTimeZone = formatTimeZoneWithOffset(browserTimeZone);
      const newTimeZoneDetected = formattedTimeZone !== dismissedTimeZoneCookie;
      if (newTimeZoneDetected) {
        dismissedTimezoneChanged = true;
      }
    }

    if (
      (timeZoneMismatch &&
        !!user?.settings?.timeZone &&
        !dismissedTimeZoneCookie) ||
      (dismissedTimeZoneCookie && dismissedTimezoneChanged)
    ) {
      setShowTimezoneDialog(true);
    }
  }, [timeZoneMismatch, user?.settings?.timeZone]);

  useEffect(() => {
    if (!isDesktop) {
      window.scrollTo(0, 0); // Scroll to top when page changes on mobile
    }
  }, [pathname, isDesktop]);

  useEffect(() => {
    // Automatically open the sidebar on desktop screens
    if (isDesktop) {
      setIsOpen(true);
    } else {
      setIsOpen(false); // Ensure it is closed on mobile screens
    }
  }, [isDesktop]);

  useEffect(() => {
    if (!user) return;
    console.log("user", user);
    console.log("user.hasUTMSaved", user.hasUTMSaved);
    if (!user.hasUTMSaved) {
      // Use Next.js useSearchParams to get query parameters
      const searchParams = new URLSearchParams(window.location.search);
      console.log("searchParams", searchParams);
      const utmSource = searchParams.get("utm_source");
      const utmMedium = searchParams.get("utm_medium");
      const utmCampaign = searchParams.get("utm_campaign");
      const utmTerm = searchParams.get("utm_term");
      const utmContent = searchParams.get("utm_content");

      if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent) {
        const utmData = {
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmTerm: utmTerm || null,
          utmContent: utmContent || null,
        };

        startTransition(async () => {
          await updateUserUTMData(user.id, utmData);
        });
      }
    }
  }, [user]);

  useEffect(() => {
    // Handle body scroll locking based on isOpen state on mobile
    if (!isDesktop && isOpen && sidebarMenuRef.current) {
      disableBodyScroll(sidebarMenuRef.current);
    } else {
      clearAllBodyScrollLocks();
    }

    return () => {
      clearAllBodyScrollLocks();
    };
  }, [isOpen, isDesktop]);

  useEffect(() => {
    if (user?.error === "inactive-user") {
      // Sign out here
      logout();
    }
  }, [user?.error]);

  if (shouldRenderWithoutSidebar) {
    return <div>{children}</div>;
  }

  return (
    <>
      <Sidebar setIsOpen={setIsOpen} isOpen={isOpen} ref={sidebarMenuRef} />
      <div
        className={cn(
          "min-h-[calc(100vh-76px)] lg:min-h-screen pt-[40px] lg:pt-[74px] pb-20 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          isOpen
            ? "lg:ml-[256px] rtl:lg:mr-[256px] rtl:lg:ml-[0px]"
            : "lg:ml-[90px] rtl:lg:mr-[90px] rtl:lg:ml-[0px]"
        )}
      >
        <div className="container mx-auto px-4">{children}</div>
      </div>
      {showTimezoneDialog && (
        <TimezoneWarningDialog
          userTimeZone={userTimeZone}
          browserTimeZone={browserTimeZone}
          showTimezoneDialog={showTimezoneDialog}
          setShowTimezoneDialog={setShowTimezoneDialog}
        />
      )}
    </>
  );
}
