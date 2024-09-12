import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center">
        <h1 className="text-6xl font-semibold text-white drop-shadow-md">
          {t("companyName")}
        </h1>
        <h2 className="font-semibold text-white drop-shadow-md text-2xl">
          {t("getStarted")}
        </h2>
        <div className="flex rtl:space-x-reverse space-x-4">
          <Link href="/auth/login">
            <Button variant="secondary" size="lg">
              {t("login")}
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="secondary" size="lg">
              {t("signUp")}
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex justify-center mt-12">
        <LanguageSwitcher primaryBtn />
      </div>
    </main>
  );
}
