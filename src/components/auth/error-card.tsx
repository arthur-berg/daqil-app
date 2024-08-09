import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useTranslations } from "next-intl";

export const ErrorCard = () => {
  const t = useTranslations("AuthPage");
  return (
    <CardWrapper
      headerLabel={t("somethingWentWrong")}
      backButtonHref="/auth/login"
      backButtonLabel={t("backToLogin")}
    >
      <div className="w-full flex justify-center items-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
};
