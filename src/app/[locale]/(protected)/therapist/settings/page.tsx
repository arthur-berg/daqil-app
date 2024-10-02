import PageTitle from "@/components/page-title";
import SettingsForm from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import { MdError } from "react-icons/md"; // Using the MdError icon for the warning
import { getUserByIdLean } from "@/data/user";

const TherapistSettingsPage = async () => {
  await connectToMongoDB();

  const t = await getTranslations("SettingsPage");
  const user = await getCurrentUser();

  if (!user) return "User not found";

  const therapist = (await getUserByIdLean(user.id)) as any;

  const paymentSettingsFound = !!therapist?.paymentSettings?.type;

  return (
    <div className="sm:w-[500px] w-full mx-auto space-y-6">
      {/* Page Title */}
      <PageTitle title={t("settings")} />

      {/* Payment Settings Card */}
      <div className="flex justify-center">
        <Card className="sm:w-[500px] w-full shadow-lg border border-gray-200">
          <CardHeader className="text-center text-xl font-semibold">
            {t("paymentDetails")}
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentSettingsFound ? (
              <>
                {therapist?.paymentSettings?.type === "personal" && (
                  <div>
                    <p>
                      <strong>{t("bankName")}:</strong>{" "}
                      {therapist.paymentSettings.personal.bankDetails.bankName}
                    </p>
                    <p>
                      <strong>{t("clearingNumber")}:</strong>{" "}
                      {
                        therapist.paymentSettings.personal.bankDetails
                          .clearingNumber
                      }
                    </p>
                    <p>
                      <strong>{t("accountNumber")}:</strong>{" "}
                      {
                        therapist.paymentSettings.personal.bankDetails
                          .accountNumber
                      }
                    </p>
                  </div>
                )}

                {therapist?.paymentSettings?.type === "company" && (
                  <div>
                    <p>
                      <strong>{t("bankName")}:</strong>{" "}
                      {therapist.paymentSettings.company.bankDetails.bankName}
                    </p>
                    <p>
                      <strong>{t("iban")}:</strong>{" "}
                      {therapist.paymentSettings.company.bankDetails.iban}
                    </p>
                    <p>
                      <strong>{t("swiftCode")}:</strong>{" "}
                      {therapist.paymentSettings.company.bankDetails.swift}
                    </p>
                  </div>
                )}

                <Link href="/therapist/settings/payment-details-overview">
                  <Button variant="outline" className="mt-4">
                    {t("seeAllPaymentDetails")}
                  </Button>
                </Link>
              </>
            ) : (
              <div className="space-y-4">
                {/* Action Required Block */}
                <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center space-x-3 border border-red-300">
                  <MdError className="w-6 h-6" />
                  <div>
                    <strong>{t("actionRequired")}:</strong>
                    <p>{t("paymentDetailsNeeded")}</p>
                  </div>
                </div>

                {/* Payment Settings Button */}
                <div className="text-center ">
                  <Link href="/therapist/settings/payment-details-setup">
                    <Button>{t("startPaymentSetup")}</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Other Settings Form */}
      <SettingsForm hidePageTitle />
    </div>
  );
};

export default TherapistSettingsPage;
