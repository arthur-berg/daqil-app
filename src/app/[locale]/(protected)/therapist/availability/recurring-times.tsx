import { DayTimes, TimeRangeStrings } from "@/generalTypes";
import { format } from "date-fns";
import { FaClock } from "react-icons/fa";

const RecurringTimes = ({
  recurringAvailableTimes,
  appointmentTypes,
  t,
}: {
  recurringAvailableTimes: DayTimes[];
  appointmentTypes: any[];
  t: any;
}) => {
  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const sortedRecurringAvailableTimes = recurringAvailableTimes.sort(
    (a: any, b: any) =>
      dayOrder.indexOf(a.day.toLowerCase()) -
      dayOrder.indexOf(b.day.toLowerCase())
  );

  // Helper function to get appointment type names by IDs and return as an array
  const getAppointmentTypeNames = (ids: string[]) => {
    return (
      appointmentTypes
        ?.filter((type) => ids.includes(type._id))
        .map((type) => type.title) || []
    ); // Ensure it always returns an array
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center mb-4">
        <FaClock className="mr-2" /> {t("recurringAvailableTimes")}
      </h2>
      <div className="space-y-4 lg:flex lg:space-y-0 lg:space-x-4">
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
                <div className="space-y-2">
                  {dayTime.timeRanges.map((timeRange: TimeRangeStrings) => (
                    <div
                      key={timeRange.startTime?.toString()}
                      className="bg-blue-200 p-2 rounded-md text-blue-900 inline-flex flex-col mr-2"
                    >
                      <div>
                        {format(new Date(timeRange.startTime), "HH:mm")} -{" "}
                        {format(new Date(timeRange.endTime), "HH:mm")}
                      </div>
                      {/* Display appointment type names as a bullet list */}
                      {/* <ul className="text-sm text-blue-700 mt-1 list-disc pl-4">
                        {(
                          getAppointmentTypeNames(
                            timeRange?.appointmentTypeIds as any
                          ) || []
                        ).map((name, index) => (
                          <li key={index}>{name}</li>
                        ))}
                      </ul> */}
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
