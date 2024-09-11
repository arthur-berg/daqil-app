import LoadingPageSpinner from "@/components/loading-page-spinner";
import { getTranslations } from "next-intl/server";

const Loading = async () => {
  const t = await getTranslations("LoadingPages");
  return <LoadingPageSpinner tValue={t("loading")} />;
};

export default Loading;
