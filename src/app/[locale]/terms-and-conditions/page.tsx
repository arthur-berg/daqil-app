import { getTranslations } from "next-intl/server";

const TermsAndConditionsPage = async () => {
  const t = await getTranslations("TermsAndConditionsPage");

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-md p-4">
        <h1 className="text-2xl font-bold mb-4">{t("title")}</h1>
        <p className="text-sm mb-6 text-gray-600">{t("lastUpdated")}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">{t("introduction.heading")}</h2>
          <p>{t("introduction.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("acceptanceOfTerms.heading")}
          </h2>
          <p>{t("acceptanceOfTerms.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">{t("eligibility.heading")}</h2>
          <p>{t("eligibility.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("privacyAndDataProtection.heading")}
          </h2>
          <p>{t("privacyAndDataProtection.content")}</p>
          <ul className="list-disc list-inside mt-4">
            <li>{t("privacyAndDataProtection.rightToAccessCorrectErase")}</li>
            <li>{t("privacyAndDataProtection.dataPortability")}</li>
            <li>{t("privacyAndDataProtection.consentWithdrawal")}</li>
            <li>{t("privacyAndDataProtection.accountDeletion")}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("useOfServices.heading")}
          </h2>
          <p>{t("useOfServices.content")}</p>

          <h3 className="text-lg font-semibold mt-4">
            {t("useOfServices.sessionRecording")}
          </h3>
          <p>{t("useOfServices.sessionRecording")}</p>

          <h3 className="text-lg font-semibold mt-4">
            {t("useOfServices.healthDisclaimer")}
          </h3>
          <p>{t("useOfServices.healthDisclaimer")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("consentToRecording.heading")}
          </h2>
          <p>{t("consentToRecording.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("paymentAndFees.heading")}
          </h2>
          <p>{t("paymentAndFees.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("therapistConduct.heading")}
          </h2>
          <p>{t("therapistConduct.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("disclaimerOfLiability.heading")}
          </h2>
          <p>{t("disclaimerOfLiability.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("userResponsibilities.heading")}
          </h2>
          <p>{t("userResponsibilities.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("securityAndAccountProtection.heading")}
          </h2>
          <p>{t("securityAndAccountProtection.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("intellectualProperty.heading")}
          </h2>
          <p>{t("intellectualProperty.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("limitationOfLiability.heading")}
          </h2>
          <p>{t("limitationOfLiability.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">{t("governingLaw.heading")}</h2>
          <p>{t("governingLaw.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("changesToTerms.heading")}
          </h2>
          <p>{t("changesToTerms.content")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("contactUs.heading")}</h2>
          <p>{t("contactUs.content")}</p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditionsPage;
