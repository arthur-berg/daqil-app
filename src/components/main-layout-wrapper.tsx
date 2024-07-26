"use client";

import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useState } from "react";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Sidebar setIsOpen={setIsOpen} isOpen={isOpen} />
      <div
        className={cn(
          "mt-[74px] min-h-[calc(100vh_-_56px)]  dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          isOpen ? "lg:ml-[256px]" : "lg:ml-[90px]"
        )}
      >
        <div className="container mx-auto px-4">{children}</div>
      </div>
    </>
  );
}
