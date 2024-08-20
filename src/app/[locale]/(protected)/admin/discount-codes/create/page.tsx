import { getTranslations } from "next-intl/server";
import DiscountCodeForm from "./discount-code-form";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

const CreateDiscountCodePage = async () => {
  const t = await getTranslations("AdminPage");
  return (
    <div>
      <Link href="/admin/discount-codes">
        <Button variant="secondary">{t("goBackDiscountOverview")}</Button>
      </Link>
      <DiscountCodeForm />
    </div>
  );
};

export default CreateDiscountCodePage;
