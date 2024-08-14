"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useState } from "react";
import { usePathname } from "@/navigation";

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
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const shouldRenderWithoutSidebar = routesWithoutSidebar.some((route) =>
    matchesPath(pathname, route)
  );

  if (shouldRenderWithoutSidebar) {
    return <div>{children}</div>;
  }

  return (
    <>
      <Sidebar setIsOpen={setIsOpen} isOpen={isOpen} />
      <div
        className={cn(
          "min-h-screen pt-[74px] pb-20 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
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
