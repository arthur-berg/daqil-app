import { getTranslations } from "next-intl/server";
import { BeatLoader } from "react-spinners";

const Loading = async () => {
  const t = await getTranslations("LoadingPages");
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <BeatLoader color="white" />
      <div className="text-lg font-medium text-white">
        {t("loadingAvailability")}
      </div>
    </div>
  );
};

export default Loading;
