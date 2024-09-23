import LanguageSwitcher from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function Home({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const t = await getTranslations("HomePage");

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="space-y-6 text-center flex flex-col items-center ">
        <Image
          width={450}
          height={173}
          src={
            locale === "en"
              ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
              : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
          }
          alt="daqil"
          className="w-[90%] sm:w-[340px]"
        />
        <h2 className="font-semibold text-white drop-shadow-md text-2xl">
          {t("getStarted")}
        </h2>
        <div className="flex rtl:space-x-reverse space-x-4 justify-center">
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
