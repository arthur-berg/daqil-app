"use client";

import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useRouter, usePathname } from "@/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";

const LanguageSwitcher = () => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
    router.push(pathname, { locale: locale as any });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="font-semibold flex items-center gap-1"
      onClick={() => handleLocaleChange(selectedLocale === "en" ? "ar" : "en")}
    >
      <span>
        {selectedLocale === "en" ? (
          <div className="text-md flex items-center flex-row-reverse">
            التبديل إلى العربية
          </div>
        ) : (
          <div className="text-md flex items-center flex-row-reverse">
            <div>Switch to english</div>
          </div>
        )}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
