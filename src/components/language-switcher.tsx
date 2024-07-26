import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/navigation";
import { useState } from "react";
import { useLocale } from "next-intl";
import { GlobeIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

const LanguageSwitcher = ({ isOpen }: { isOpen?: boolean }) => {
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
      variant="ghost"
      className="w-full justify-end md:justify-start h-10  mb-1"
      onClick={() => handleLocaleChange(selectedLocale === "en" ? "ar" : "en")}
    >
      <span className={cn(isOpen === false ? "" : "mr-4 rtl:mr-0 rtl:ml-4")}>
        <GlobeIcon className="h-4 w-4" />
      </span>
      <div
        className={cn(
          "max-w-[200px] truncate text-xs",
          isOpen === false
            ? "-translate-x-96 opacity-0"
            : "translate-x-0 opacity-100"
        )}
      >
        {selectedLocale === "en" ? (
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
      </div>
    </Button>
  );
};

export default LanguageSwitcher;
