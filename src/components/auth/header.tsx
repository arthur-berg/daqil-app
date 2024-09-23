import { useLocale } from "next-intl";
import Image from "next/image";

type HeaderProps = {
  label: string;
};

export const Header = ({ label }: HeaderProps) => {
  const locale = useLocale();
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <Image
        width={350}
        height={144}
        src={
          locale === "en"
            ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
            : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
        }
        alt="daqil"
        className="w-[60%] sm:w-full"
      />

      <p className="text-muted-foreground text-xl">{label}</p>
    </div>
  );
};
