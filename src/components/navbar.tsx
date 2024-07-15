"use client";

import { usePathname } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { UserButton } from "@/components/auth/user-button";
import LanguageSwitcher from "./language-switcher";

export const Navbar = () => {
  const pathname = usePathname();
  return (
    <nav className="bg-secondary flex justify-between items-center p-4 w-full shadow-lg">
      <div className="flex gap-x-2 container justify-end">
        {/* <Button
          asChild
          variant={pathname === "/server" ? "default" : "outline"}
        >
          <Link href="/server">Server</Link>
        </Button>
        <Button
          asChild
          variant={pathname === "/client" ? "default" : "outline"}
        >
          <Link href="/client">Client</Link>
        </Button> */}
        {/* <Button asChild variant={pathname === "/admin" ? "default" : "outline"}>
          <Link href="/admin">Admin</Link>
        </Button> */}
        {/* <Button
          asChild
          variant={pathname === "/settings" ? "default" : "outline"}
        >
          <Link href="/settings">Settings</Link>
        </Button> */}
        <LanguageSwitcher />
      </div>
      <UserButton />
    </nav>
  );
};
