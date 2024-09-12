"use client";

import Link from "next/link";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/sidebar/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useLocale, useTranslations } from "next-intl";
import { useCurrentRole } from "@/hooks/use-current-role";
import {
  getAdmintMenuList,
  getClientMenuList,
  getTherapistMenuList,
} from "@/utils/menu-list";
import { LogoutButton } from "../auth/logout-button";
import { ExitIcon } from "@radix-ui/react-icons";
import LanguageSwitcher from "../language-switcher";
import { useEffect } from "react";

interface MenuProps {
  isOpen: boolean | undefined;
  setIsOpen: any;
}

export function Menu({ isOpen, setIsOpen }: MenuProps) {
  const pathname = usePathname();
  const { isTherapist, isClient } = useCurrentRole();
  const locale = useLocale();
  const t = useTranslations("Sidebar");

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const menuList = isTherapist
    ? getTherapistMenuList(pathname, t)
    : isClient
    ? getClientMenuList(pathname, t)
    : getAdmintMenuList(pathname, t);

  return (
    <>
      <div
        className={cn(
          "w-full px-2 mt-4",
          isOpen === true && "flex justify-center"
        )}
      >
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <div>
                <LanguageSwitcher isOpen={isOpen} />
              </div>
            </TooltipTrigger>
            {isOpen === false && (
              <TooltipContent side="right">
                {locale === "en" ? (
                  <>
                    <div>التبديل إلى العربية</div>
                    <div>Switch to Arabic</div>
                  </>
                ) : (
                  <>
                    <div>Switch to English</div>
                    <div>التبديل إلى اللغة الإنجليزية</div>
                  </>
                )}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-col h-full">
        <ScrollArea className="[&>div>div[style]]:!block flex-1">
          <nav className="mt-8 h-full w-full">
            <ul className="flex flex-col items-start space-y-1 px-2">
              {menuList.map(({ groupLabel, menus }, index) => (
                <li
                  className={cn("w-full", groupLabel ? "pt-5" : "")}
                  key={index}
                >
                  {(isOpen && groupLabel) || isOpen === undefined ? (
                    <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                      {groupLabel}
                    </p>
                  ) : !isOpen && isOpen !== undefined && groupLabel ? (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger className="w-full">
                          <div className="w-full flex justify-center items-center">
                            <DotsHorizontalIcon className="h-5 w-5" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{groupLabel}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <p className="pb-2"></p>
                  )}
                  {menus.map(
                    ({ href, label, icon: Icon, active, submenus }, index) =>
                      submenus.length === 0 ? (
                        <div className="w-full" key={index}>
                          <TooltipProvider disableHoverableContent>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start h-10 mb-1 rtl:flex-row-reverse",
                                    active ? "bg-primary text-white" : ""
                                  )}
                                  asChild
                                >
                                  <Link href={href}>
                                    <span
                                      className={cn(
                                        isOpen === false
                                          ? ""
                                          : "mr-4 rtl:mr-0 rtl:ml-4"
                                      )}
                                    >
                                      <Icon size={18} />
                                    </span>
                                    <p
                                      className={cn(
                                        "max-w-[200px] truncate",
                                        isOpen === false
                                          ? "-translate-x-96 opacity-0"
                                          : "translate-x-0 opacity-100"
                                      )}
                                    >
                                      {label}
                                    </p>
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              {isOpen === false && (
                                <TooltipContent side="right">
                                  {label}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <div className="w-full" key={index}>
                          <CollapseMenuButton
                            icon={Icon}
                            label={label}
                            active={active}
                            submenus={submenus}
                            isOpen={isOpen}
                          />
                        </div>
                      )
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
        <div className="w-full px-2 mb-28">
          <TooltipProvider disableHoverableContent>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <LogoutButton isOpen={isOpen}>
                  <Button
                    onClick={() => {}}
                    variant="ghost"
                    className="w-full justify-start h-10 mb-1"
                  >
                    <span
                      className={cn(
                        isOpen === false ? "" : "mr-4 rtl:mr-0 rtl:ml-4"
                      )}
                    >
                      <ExitIcon className="h-4 w-4" />
                    </span>
                    <p
                      className={cn(
                        "max-w-[200px] truncate",
                        isOpen === false
                          ? "-translate-x-96 opacity-0"
                          : "translate-x-0 opacity-100"
                      )}
                    >
                      {t("logout")}
                    </p>
                  </Button>
                </LogoutButton>
              </TooltipTrigger>
              {isOpen === false && (
                <TooltipContent side="right"> {t("logout")}</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </>
  );
}
