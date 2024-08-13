import { DayTimes, TimeRangeStrings } from "@/generalTypes";
import { FaClock } from "react-icons/fa";

const RecurringTimes = ({
  recurringAvailableTimes,
  t,
}: {
  recurringAvailableTimes: DayTimes[];
  t: any;
}) => {
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const sortedRecurringAvailableTimes = recurringAvailableTimes.sort(
    (a: any, b: any) =>
      dayOrder.indexOf(a.day.toLowerCase()) -
      dayOrder.indexOf(b.day.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center mb-4">
        <FaClock className="mr-2" /> {t("recurringAvailableTimes")}
      </h2>
      <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
        {sortedRecurringAvailableTimes.length === 0 ? (
          <p className="text-blue-800">{t("noTimeSlotsFound")}</p>
        ) : (
          sortedRecurringAvailableTimes.map((dayTime: DayTimes) =>
            dayTime?.day ? (
              <div
                key={dayTime.day}
                className="bg-blue-100 shadow-md rounded-lg p-4 flex-1"
              >
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  {dayTime.day.charAt(0).toUpperCase() + dayTime.day.slice(1)}
                </h3>
                <div className="space-y-2 ">
                  {dayTime.timeRanges.map((timeRange: TimeRangeStrings) => (
                    <div
                      key={timeRange.startTime}
                      className="bg-blue-200 p-2 rounded-md text-blue-900 inline-flex mr-2"
                    >
                      {timeRange.startTime} - {timeRange.endTime}
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
};

export default RecurringTimes;
