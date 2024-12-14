"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { markProfessionalAgreementAsDone } from "@/actions/markProfessionalAgreementAsDone";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "@/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { BeatLoader } from "react-spinners";
import { MdCheckCircle } from "react-icons/md";

const ProfessionalAgreementPage = () => {
  const t = useTranslations("ProfessionalAgreementPage");
  const [isChecked, setIsChecked] = useState(false);
  const [isPending, startTransition] = useTransition();
  const user = useCurrentUser();
  const { responseToast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAcceptClick = () => {
    if (isChecked) {
      setIsLoading(true);
      startTransition(async () => {
        const data = await markProfessionalAgreementAsDone();
        responseToast(data);
        window.location.assign(`/therapist/settings`);
      });
    }
  };

  useEffect(() => {
    if (user?.professionalAgreementAccepted) {
      router.push("/therapist/settings");
    }
  }, [user?.professionalAgreementAccepted, router]);

  if (user?.professionalAgreementAccepted) {
    return (
      <div className="container py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-md p-6 flex flex-col items-center space-y-4">
          {/* Success Checkmark */}
          <MdCheckCircle className="text-green-500 text-5xl" />
          <p className="text-lg font-medium text-gray-700">
            {t("documentAcceptedMessage")}
          </p>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center space-y-2">
            <BeatLoader color="#4F46E5" size={15} />
            <p className="text-gray-700 text-sm">
              {t("redirectingToSettings")}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex flex-col items-center justify-center space-y-4">
          <BeatLoader color="#4F46E5" size={15} />
          <div className="bg-black bg-opacity-25 text-white px-4 py-2 rounded-md">
            <p className="text-lg font-medium text-black">
              {t("reloadingPage")}
            </p>
          </div>
        </div>
      )}
      <div className="container py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-md p-6">
          <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              {t("introduction.heading")}
            </h2>
            <p>{t("introduction.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">{t("services.heading")}</h2>
            <p>{t("services.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">{t("compliance.heading")}</h2>
            <p>{t("compliance.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              {t("confidentiality.heading")}
            </h2>
            <p>{t("confidentiality.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              {t("relationship.heading")}
            </h2>
            <p>{t("relationship.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">{t("referrals.heading")}</h2>
            <p>{t("referrals.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              {t("restrictions.heading")}
            </h2>
            <p>{t("restrictions.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">{t("renewal.heading")}</h2>
            <p>{t("renewal.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">{t("payment.heading")}</h2>
            <p>{t("payment.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold">
              {t("termination.heading")}
            </h2>
            <p>{t("termination.content")}</p>
          </section>
          {!user?.professionalAgreementAccepted && (
            <>
              <div className="flex items-center mt-6 space-x-2 rtl:space-x-reverse">
                <Checkbox
                  id="acceptAgreement"
                  checked={isChecked}
                  onCheckedChange={(checked) => setIsChecked(!!checked)}
                />
                <label
                  htmlFor="acceptAgreement"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("acceptCheckbox")}
                </label>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleAcceptClick}
                  className="w-full"
                  disabled={!isChecked || isPending}
                >
                  {t("acceptButton")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAgreementPage;
