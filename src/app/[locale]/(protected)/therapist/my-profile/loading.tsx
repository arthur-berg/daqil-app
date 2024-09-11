import LoadingPageSpinner from "@/components/loading-page-spinner";
import { getTranslations } from "next-intl/server";
import { BeatLoader } from "react-spinners";

const Loading = async () => {
  const t = await getTranslations("LoadingPages");
  return <LoadingPageSpinner tValue={t("loadingProfile")} />;
};

export default Loading;
