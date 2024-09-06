import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getDiscountCodes } from "@/data/discount-codes";
import DeleteDiscountButton from "./delete-discount-button";
import connectToMongoDB from "@/lib/mongoose";

const DiscountCodesPage = async () => {
  await connectToMongoDB();
  const discountCodes = await getDiscountCodes();
  const t = await getTranslations("AdminPage");

  return (
    <>
      <div className="flex justify-center">
        <Link href="/admin/discount-codes/create">
          <Button size="sm">{t("createDiscountCode")}</Button>
        </Link>
      </div>
      <div className="mt-6">
        <h3 className="text-md font-medium text-center">
          {t("existingDiscountCodes")}
        </h3>
        <div className="space-y-4 mt-4 flex flex-col items-center">
          {discountCodes?.map((code: any, index) => (
            <div
              key={index}
              className="inline-flex flex-col items-center border p-4 rounded-lg shadow-lg bg-white w-80"
              style={{
                borderStyle: "dashed",
                borderWidth: "2px",
                borderColor: "#cbd5e0",
                background:
                  "linear-gradient(135deg, #f7fafc 25%, #edf2f7 100%)",
              }}
            >
              <div className="mb-2 text-center">
                <h4 className="text-xl font-semibold tracking-wider text-indigo-600">
                  {code.code}
                </h4>
                <p className="text-xs text-gray-500">
                  {code.firstTimeUserOnly
                    ? t("firstTimeUsersOnly")
                    : t("allUsers")}
                </p>
              </div>
              <div className="mb-2 text-sm text-center text-gray-700">
                <p>
                  <strong>{t("discount")}:</strong> {code.percentage}%
                </p>
                <p>
                  <strong>{t("limitPerUser")}:</strong>{" "}
                  {code.limitPerUser ?? t("unlimited")}
                </p>
              </div>
              <div className="mb-2 text-sm text-center text-gray-700">
                <p>
                  <strong>{t("startDateLabel")}:</strong>{" "}
                  {code.startDate
                    ? new Date(code.startDate).toLocaleDateString()
                    : t("notSet")}
                </p>
                <p>
                  <strong>{t("endDateLabel")}:</strong>{" "}
                  {code.endDate
                    ? new Date(code.endDate).toLocaleDateString()
                    : t("notSet")}
                </p>
              </div>
              <div className="text-center">
                <DeleteDiscountButton discountCodeId={code._id.toString()} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DiscountCodesPage;
