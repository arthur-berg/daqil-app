"use client";

import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { newVerification } from "@/actions/new-verification";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const t = useTranslations("AuthPage");
  const tError = useTranslations("ErrorMessages");

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError(tError("missingToken"));
      return;
    }
    newVerification(token)
      .then(async (data) => {
        if (data.success) {
          setSuccess(data.success);
          router.push(
            `/auth/setup?email=${encodeURIComponent(
              data.email
            )}&token=${encodeURIComponent(token)}`
          );

          return;
        }
        if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        setError(tError("somethingWentWrong"));
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel={t("confirmingVerification")}
      backButtonHref="/auth/login"
      backButtonLabel={t("backToLogin")}
      hideLanguageSwitch
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader />}
        <div className="flex flex-col items-center">
          <FormSuccess message={success} />
          {success && (
            <>
              <div className="mb-2 mt-6">{t("redirecting")}</div>
              <BeatLoader />
            </>
          )}
        </div>
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};
