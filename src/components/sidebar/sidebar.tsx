"use client";
import { useRef, useEffect, forwardRef } from "react";
import { ChevronLeftIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/sidebar/menu";
import LanguageSwitcher from "../language-switcher";
import Image from "next/image";
import { useLocale } from "next-intl";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: any;
}

function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div
      className={cn(
        "absolute top-[12px] z-20 transition-transform duration-300 ease-in-out will-change-transform",
        isOpen
          ? "translate-x-0 right-[-16px] rtl:right-[190px] rtl:lg:right-[240px]"
          : "translate-x-[100%] sm:right-[40px] lg:right-[16px] rtl:lg:right-[105px]"
      )}
    >
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="rounded-md w-8 h-8"
        variant="outline"
        size="icon"
      >
        <ChevronLeftIcon
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700",
            isOpen === false ? "rotate-180" : "rotate-0"
            // Ensures the icon points correctly in RTL mode
          )}
        />
      </Button>
    </div>
  );
}

export const Sidebar = forwardRef<
  HTMLDivElement,
  {
    setIsOpen: any;
    isOpen: boolean;
  }
>(({ setIsOpen, isOpen }, sidebarMenuRef) => {
  const sidebarRef = useRef<any>();
  const locale = useLocale();

  // Close sidebar when clicking outside on screens smaller than lg
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebarMenuElement = (
        sidebarMenuRef as React.MutableRefObject<HTMLDivElement | null>
      ).current;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarMenuElement && // Check that the ref is not null and is an HTMLDivElement
        !sidebarMenuElement.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen && window.innerWidth < 1024) {
      // Only add event listener for screens smaller than lg
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen, sidebarMenuRef]);

  return (
    <>
      <nav className="bg-secondary justify-between items-center p-4 w-full shadow-lg flex lg:hidden">
        <HamburgerMenuIcon
          className="h-6 w-6"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              setIsOpen(true);
            }
          }}
        />
        <div className="inline-flex gap-x-2 container justify-end">
          <LanguageSwitcher />
        </div>
      </nav>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed bg-secondary top-0 left-0 rtl:right-0 rtl:left-auto z-20 h-screen lg:transition-transform lg:ease-in-out lg:duration-300",
          isOpen
            ? "translate-x-0 w-52 lg:w-64 rtl:translate-x-0"
            : "-translate-x-full lg:w-[90px] lg:translate-x-0 rtl:translate-x-full rtl:lg:translate-x-0"
        )}
      >
        <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
        <div
          ref={sidebarMenuRef}
          className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800"
        >
          <div
            className={cn(
              "w-full transition-opacity ease-in-out duration-300",
              isOpen
                ? "translate-x-0 opacity-100 rtl:translate-x-0"
                : "-translate-x-96 opacity-0 rtl:translate-x-96"
            )}
          >
            <div className="flex justify-center">
              <Image
                height={100}
                width={250}
                alt="Logo"
                className="w-[80%]"
                src={
                  locale === "en"
                    ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
                    : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
                }
              />
            </div>
          </div>
          <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </aside>
    </>
  );
});

Sidebar.displayName = "Sidebar";
