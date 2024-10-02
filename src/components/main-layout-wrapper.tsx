"use client";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/navigation";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import { useMediaQuery } from "react-responsive";

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
  const pathname = usePathname();
  const sidebarMenuRef = useRef<any>();

  const shouldRenderWithoutSidebar = routesWithoutSidebar.some((route) =>
    matchesPath(pathname, route)
  );

  const isDesktop = useMediaQuery({ query: "(min-width: 1024px)" });

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
    </>
  );
}
