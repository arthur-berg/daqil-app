"use client";

import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";

const LanguageSwitcher = ({ secondary }: { secondary?: boolean }) => {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const handleLocaleChange = (locale: string) => {
    setSelectedLocale(locale);
    router.push(pathname, { locale: locale as any });
    router.refresh();
  };

  return (
    <Button
      variant={secondary ? "secondary" : "ghost"}
      size="sm"
      className="font-semibold flex items-center gap-1"
      onClick={() => handleLocaleChange(selectedLocale === "en" ? "ar" : "en")}
    >
      <span>
        {selectedLocale === "en" ? (
          <div className="flex items-center text-md flex-col">
            <div>التبديل إلى العربية</div>
            <div>Switch to arabic</div>
          </div>
        ) : (
          <div className="text-md flex items-center flex-col">
            <div>Switch to english</div>
            <div>التبديل إلى اللغة الإنجليزية</div>
          </div>
        )}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
