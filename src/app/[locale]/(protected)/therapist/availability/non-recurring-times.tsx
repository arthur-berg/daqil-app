import { DateTimes, TimeRange } from "@/generalTypes";
import { formatDateTime } from "@/utils";
import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";

const NonRecurringTimes = ({
  nonRecurringAvailableTimes,
  appointmentTypes,
  t,
}: {
  nonRecurringAvailableTimes: DateTimes[];
  appointmentTypes: any[];
  t: any;
}) => {
  // Helper function to get appointment type names
  const getAppointmentTypeNames = (ids: string[]) => {
    return appointmentTypes
      ?.filter((type) => ids.includes(type._id))
      .map((type) => type.title);
  };

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-green-600 flex items-center mb-4">
        <FaCalendarAlt className="mr-2" /> {t("nonRecurringAvailableTimes")}
      </h2>
      <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
        {nonRecurringAvailableTimes.length === 0 ? (
          <p className="text-green-800">{t("noTimeSlotsFound")}</p>
        ) : (
          nonRecurringAvailableTimes.map((dateTime: DateTimes) => (
            <div
              key={dateTime.date?.toString()}
              className="bg-green-100 shadow-md rounded-lg p-4 flex-1"
            >
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {format(new Date(dateTime.date!), "yyyy-MM-dd")}
              </h3>
              <div className="space-y-2">
                {dateTime.timeRanges.map((timeRange: TimeRange) => (
                  <div
                    key={timeRange.startDate?.toString()}
                    className="bg-green-200 p-2 rounded-md text-green-900 inline-flex flex-col mr-2"
                  >
                    <div>
                      {formatDateTime(timeRange.startDate!)} -{" "}
                      {formatDateTime(timeRange.endDate!)}
                    </div>
                    {/* Display appointment type names as a list */}
                    <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                      {getAppointmentTypeNames(
                        timeRange.appointmentTypeIds as any
                      ).map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NonRecurringTimes;
