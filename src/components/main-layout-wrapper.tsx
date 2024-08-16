"use client";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useState } from "react";
import { usePathname } from "@/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbsList } from "@/utils/breadcrumbs-list";
import { useTranslations } from "next-intl";

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

function findBreadcrumbs(pathname: string, t: any) {
  const breadcrumbs = [];
  const segments = pathname.split("/").filter(Boolean);

  let cumulativePath = "";
  const breadcrumbList = getBreadcrumbsList(t);

  for (let i = 0; i < segments.length; i++) {
    cumulativePath += `/${segments[i]}`;

    // Check for exact match or match with dynamic segments
    const breadcrumb = breadcrumbList.find((b) => {
      const dynamicSegmentPattern = b.path.replace(/\[.*?\]/g, "[^/]+");
      const regex = new RegExp(`^${dynamicSegmentPattern}$`);
      return regex.test(cumulativePath);
    });

    if (breadcrumb) {
      breadcrumbs.push({
        path: cumulativePath,
        label: breadcrumb.label,
      });
    }
  }

  return breadcrumbs;
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const t = useTranslations("Breadcrumbs");

  const shouldRenderWithoutSidebar = routesWithoutSidebar.some((route) =>
    matchesPath(pathname, route)
  );

  const breadcrumbs = findBreadcrumbs(pathname, t);

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
        <div className="container mx-auto px-4">
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="inline-block bg-white rounded-md p-2 mb-2">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.path}
                          className="hover:text-primary hover:underline"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {children}
        </div>
      </div>
    </>
  );
}
