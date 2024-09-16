"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

const IntroCallStepManager = () => {
  const [step, setStep] = useState(1);
  const t = useTranslations("BookAppointmentPage");
  return step === 1 ? (
    <div className="flex justify-center gap-6 mb-6">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold mb-4">{t("introCallTitle")}</h2>
        <p className="mb-4">{t("introCallDescription")}</p>

        <Button className="w-full py-4 text-lg" onClick={() => setStep(2)}>
          {t("bookIntroCall")}
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex-col sm:flex-row gap-6 mb-6">
      <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 w-full sm:w-1/2 mb-4 sm:mb-0">
        <div>
          <h2 className="text-xl font-bold mb-4">{t("chooseForMe")}</h2>
          <p className="mb-4">{t("chooseForMeDescription")}</p>
        </div>
        <Link href="/book-appointment/intro-call">
          <Button className="w-full py-4 text-lg mt-auto">
            {t("seeAvailableTimes")}
          </Button>
        </Link>
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 w-full sm:w-1/2">
        <div>
          <h2 className="text-xl font-bold mb-4">
            {t("browseTherapistsTitle")}
          </h2>
          <p className="mb-4">{t("browseTherapistsDescription")}</p>
        </div>
        <Link href="/book-appointment/browse-therapists">
          <Button className="w-full py-4 text-lg mt-auto">
            {t("browseTherapistsButton")}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default IntroCallStepManager;
