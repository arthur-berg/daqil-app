import { DateTimes, TimeRange } from "@/generalTypes";
import { formatDateTime } from "@/utils";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { format } from "date-fns";
import { useLocale } from "next-intl";
import { FaBan, FaTrash } from "react-icons/fa";

const BlockedOutTimes = ({
  blockedOutTimes,
  t,
  overview,
  handleRemoveBlockedDate,
}: {
  blockedOutTimes: DateTimes[];
  t: any;
  overview?: boolean;
  handleRemoveBlockedDate?: any;
}) => {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = useLocale();

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-red-600 flex items-center mb-4">
        <FaBan className="mr-2" /> {t("blockedOutTimes")}
      </h2>
      {!overview && (
        <div className="mt-4 mb-4">
          <p className="text-gray-700 text-md font-medium bg-gray-50 px-4 py-2 rounded-md border border-gray-300 inline-block max-w-2xl">
            {t("scheduleInYourTimezone", {
              browserTimeZone: browserTimeZoneFormatted,
            })}
          </p>
        </div>
      )}

      <div className="space-y-4 md:inline-flex md:space-y-0 md:space-x-4">
        {blockedOutTimes.length === 0 ? (
          <p className="text-red-800">{t("noTimeSlotsFound")}</p>
        ) : (
          blockedOutTimes.map((dateTime: DateTimes) => (
            <div
              key={dateTime.date?.toString()}
              className="bg-red-100 shadow-md rounded-lg p-4 flex-1"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-red-800">
                  {format(new Date(dateTime.date!), "yyyy-MM-dd")}
                </h3>
                {!overview && (
                  <button
                    className="text-red-600 hover:text-red-800 ml-8"
                    onClick={() =>
                      handleRemoveBlockedDate(new Date(dateTime.date!))
                    }
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {dateTime.timeRanges.map(
                  (timeRange: TimeRange, index: number) => (
                    <div
                      key={`${timeRange.startDate?.toString()}${index}`}
                      className="bg-red-200 p-2 rounded-md text-red-900 inline-flex mr-2"
                    >
                      <div dir={locale === "ar" ? "rtl" : "ltr"}>
                        {formatDateTime(timeRange.startDate!)} -{" "}
                        {formatDateTime(timeRange.endDate!)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlockedOutTimes;
