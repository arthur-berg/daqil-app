import PageTitle from "@/components/page-title";
import SettingsForm from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

const TherapistSettingsPage = async () => {
  await connectToMongoDB();

  const t = await getTranslations("SettingsPage");
  return (
    <div>
      <div className="sm:w-[500px] w-full mx-auto">
        <PageTitle title={t("settings")} />
      </div>
      <div className="flex justify-center">
        <Card className="sm:w-[500px] w-full">
          <CardHeader>Payments</CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/therapist/settings/payment">
              <Button>{t("paymentSettings")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <SettingsForm hidePageTitle />
    </div>
  );
};

export default TherapistSettingsPage;
