import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

const AdminPage = async () => {
  const t = await getTranslations("AdminPage");
  return (
    <div className="w-full md:w-[600px] mx-auto space-y-4">
      <Card>
        <CardHeader>
          <p>🔑 {t("adminDashboard")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Link href="/admin/therapists">
              <div className="p-4 border rounded-md shadow-md hover:bg-gray-100 transition">
                <p className="text-lg font-medium">{t("manageTherapists")}</p>
              </div>
            </Link>
          </div>
          <div>
            <Link href="/admin/discount-codes">
              <div className="p-4 border rounded-md shadow-md hover:bg-gray-100 transition">
                <p className="text-lg font-medium">
                  {t("manageDiscountCodes")}
                </p>
              </div>
            </Link>
          </div>
          <div>
            <Link href="/admin/dashboard">
              <div className="p-4 border rounded-md shadow-md hover:bg-gray-100 transition">
                <p className="text-lg font-medium">{t("clientOverview")}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
