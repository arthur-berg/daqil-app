import { MdCheck } from "react-icons/md";
import { getCurrentUser } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

const PaymentSettingsOverviewPage = async ({
  searchParams: { newInformationSaved },
}: {
  searchParams: { newInformationSaved?: string };
}) => {
  await connectToMongoDB();

  const user = await getCurrentUser();
  if (!user) return "No user found";
  const { paymentSettings } = user;
  const savedType = paymentSettings?.type;

  const t = await getTranslations("PaymentSettingsPage");

  return (
    <div className="max-w-2xl mx-auto bg-white py-6 px-4 sm:p-10 rounded-md relative">
      {newInformationSaved && (
        <div className="flex items-center text-green-600 mb-4">
          <MdCheck size={24} className="mr-2" />
          <span>{t("paymentDetailsSavedSuccess")}</span>
        </div>
      )}
      <div>
        <Link href="/therapist/settings">
          <Button variant="secondary">
            {newInformationSaved ? t("goToSettings") : t("goBack")}
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("yourPaymentDetails")}
        </h2>

        {savedType === "personal" && (
          <div>
            <h3 className="text-lg font-semibold">{t("personalDetails")}</h3>
            <p>
              <strong>{t("firstName")}:</strong>{" "}
              {paymentSettings.personal.kyc.firstName}
            </p>
            <p>
              <strong>{t("lastName")}:</strong>{" "}
              {paymentSettings.personal.kyc.lastName}
            </p>
            <p>
              <strong>{t("dateOfBirth")}:</strong>{" "}
              {format(
                new Date(paymentSettings.personal.kyc.dateOfBirth),
                "yyyy-MM-dd"
              )}
            </p>
            <p>
              <strong>{t("placeOfBirth")}:</strong>{" "}
              {paymentSettings.personal.kyc.placeOfBirth}
            </p>
            <p>
              <strong>{t("citizenship")}:</strong>{" "}
              {paymentSettings.personal.kyc.citizenship}
            </p>

            <h4 className="mt-4 font-semibold">{t("bankDetails")}</h4>
            <p>
              <strong>{t("bankName")}:</strong>{" "}
              {paymentSettings.personal.bankDetails.bankName}
            </p>
            <p>
              <strong>{t("accountNumber")}:</strong>{" "}
              {paymentSettings.personal.bankDetails.accountNumber}
            </p>
            <p>
              <strong>{t("clearingNumber")}:</strong>{" "}
              {paymentSettings.personal.bankDetails.clearingNumber}
            </p>
            <p>
              <strong>{t("accountType")}:</strong>{" "}
              {paymentSettings.personal.bankDetails.accountType}
            </p>
          </div>
        )}

        {savedType === "company" && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">{t("companyDetails")}</h3>
            <p>
              <strong>{t("ownerName")}:</strong>{" "}
              {paymentSettings.company.kyc.ownerName}
            </p>
            <p>
              <strong>{t("ownerRole")}:</strong>{" "}
              {paymentSettings.company.kyc.ownerRole}
            </p>
            <p>
              <strong>{t("dateOfBirth")}:</strong>{" "}
              {format(
                new Date(paymentSettings.company.kyc.dateOfBirth),
                "yyyy-MM-dd"
              )}
            </p>
            <p>
              <strong>{t("placeOfBirth")}:</strong>{" "}
              {paymentSettings.company.kyc.placeOfBirth}
            </p>
            <p>
              <strong>{t("citizenship")}:</strong>{" "}
              {paymentSettings.company.kyc.citizenship}
            </p>
            <p>
              <strong>{t("companyRegistration")}:</strong>{" "}
              {paymentSettings.company.kyc.companyRegistration}
            </p>

            <h4 className="mt-4 font-semibold">{t("bankDetails")}</h4>
            <p>
              <strong>{t("bankName")}:</strong>{" "}
              {paymentSettings.company.bankDetails.bankName}
            </p>
            <p>
              <strong>{t("iban")}:</strong>{" "}
              {paymentSettings.company.bankDetails.iban}
            </p>
            <p>
              <strong>{t("swiftCode")}:</strong>{" "}
              {paymentSettings.company.bankDetails.swift}
            </p>
          </div>
        )}

        {!savedType && <p>{t("noPaymentDetailsSaved")}</p>}
      </div>
    </div>
  );
};

export default PaymentSettingsOverviewPage;
