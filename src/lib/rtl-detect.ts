import { getLocale } from "next-intl/server";
import { getLangDir } from "rtl-detect";

export const getIsArabicSelected = async () => {
  const locale = await getLocale();
  const direction = getLangDir(locale);

  return direction === "rtl";
};
