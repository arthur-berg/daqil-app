"use client";

import { usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { UserButton } from "@/components/auth/user-button";
import LanguageSwitcher from "./language-switcher";

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-secondary flex justify-between items-center p-4 w-full shadow-lg">
      <HamburgerMenuIcon className="h-6 w-6" />
      <div className="flex gap-x-2 container justify-end">
        <LanguageSwitcher />
      </div>
      {/*  <UserButton /> */}
    </nav>
  );
};
