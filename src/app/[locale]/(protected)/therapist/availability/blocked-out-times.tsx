import { DateTimes, TimeRange } from "@/generalTypes";
import { formatDateTime } from "@/utils";
import { format } from "date-fns";
import { FaBan } from "react-icons/fa";

const BlockedOutTimes = ({
  blockedOutTimes,
  t,
}: {
  blockedOutTimes: DateTimes[];
  t: any;
}) => {
  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-red-600 flex items-center mb-4">
        <FaBan className="mr-2" /> {t("blockedOutTimes")}
      </h2>
      <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
        {blockedOutTimes.map((dateTime: DateTimes) => (
          <div
            key={dateTime.date?.toString()}
            className="bg-red-100 shadow-md rounded-lg p-4 flex-1"
          >
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {format(new Date(dateTime.date!), "yyyy-MM-dd")}
            </h3>
            <div className="space-y-2">
              {dateTime.timeRanges.map((timeRange: TimeRange) => (
                <div
                  key={timeRange.startDate?.toString()}
                  className="bg-red-200 p-2 rounded-md text-red-900 inline-flex mr-2"
                >
                  {formatDateTime(timeRange.startDate!)} -{" "}
                  {formatDateTime(timeRange.endDate!)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockedOutTimes;
