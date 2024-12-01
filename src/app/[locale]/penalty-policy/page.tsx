import { getTranslations } from "next-intl/server";

const PenaltyPolicyPage = async () => {
  const t = await getTranslations("PenaltyPolicyPage");

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
            {t("policyOverview.heading")}
          </h2>
          <p>{t("policyOverview.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">{t("fineDetails.heading")}</h2>
          <p>{t("fineDetails.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">
            {t("detectionMethods.heading")}
          </h2>
          <p>{t("detectionMethods.content")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold">{t("agreement.heading")}</h2>
          <p>{t("agreement.content")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">{t("contactUs.heading")}</h2>
          <p>{t("contactUs.content")}</p>
        </section>
      </div>
    </div>
  );
};

export default PenaltyPolicyPage;
