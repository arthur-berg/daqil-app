"use client";
import { useRef, useEffect } from "react";
import { ChevronLeftIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "@/components/sidebar/menu";
import LanguageSwitcher from "../language-switcher";
import { disableBodyScroll, clearAllBodyScrollLocks } from "body-scroll-lock";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: any;
}

function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div
      className={cn(
        "absolute top-[12px] z-20 transition-transform duration-300 ease-in-out",
        isOpen
          ? "translate-x-0 right-[-16px]"
          : "translate-x-[100%] sm:-right-[-32px] lg:-right-[-16px]"
      )}
    >
      <Button
        onClick={() => {
          clearAllBodyScrollLocks();
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
          )}
        />
      </Button>
    </div>
  );
}

export function Sidebar({
  setIsOpen,
  isOpen,
}: {
  setIsOpen: any;
  isOpen: boolean;
}) {
  const sidebarMenuRef = useRef<any>();
  const sidebarRef = useRef<any>();

  // Close sidebar on menu item click
  const handleMenuItemClick = () => {
    if (isOpen) {
      clearAllBodyScrollLocks();
      setIsOpen(false);
    }
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
        clearAllBodyScrollLocks();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <>
      <nav className="bg-secondary justify-between items-center p-4 w-full shadow-lg flex lg:hidden">
        <HamburgerMenuIcon
          className="h-6 w-6"
          onClick={() => {
            if (isOpen) {
              clearAllBodyScrollLocks();
              setIsOpen(false);
            } else {
              setIsOpen(true);
              disableBodyScroll(sidebarMenuRef.current);
            }
          }}
        />
        <div className="flex gap-x-2 container justify-end">
          <LanguageSwitcher />
        </div>
      </nav>
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed bg-secondary top-0 left-0 rtl:left-auto rtl:right-0 z-20 h-screen lg:transition-transform lg:ease-in-out lg:duration-300",
          isOpen
            ? "translate-x-0 w-52 lg:w-64"
            : "-translate-x-full lg:w-[90px] lg:translate-x-0"
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
              isOpen ? "translate-x-0 opacity-100" : "-translate-x-96 opacity-0"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/zakina-logo.png" alt="zakina" className="object-cover" />
          </div>
          <Menu isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </aside>
    </>
  );
}
