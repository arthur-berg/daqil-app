import {
  AvailableTimes,
  DayTimes,
  DateTimes,
  TimeRangeStrings,
  TimeRange,
} from "@/generalTypes";
import { formatDateTime } from "@/utils";
import { format } from "date-fns";
import { FaClock, FaCalendarAlt, FaBan } from "react-icons/fa";

const Overview = ({ availableTimes }: { availableTimes: AvailableTimes }) => {
  const { recurringAvailableTimes, specificAvailableTimes, blockedOutTimes } =
    availableTimes;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center mb-4">
          <FaClock className="mr-2" /> Recurring Availability
        </h2>
        <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
          {recurringAvailableTimes.map((dayTime: DayTimes) => (
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
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-green-600 flex items-center mb-4">
          <FaCalendarAlt className="mr-2" /> Specific Available Times
        </h2>
        <div className="space-y-4 md:flex md:space-y-0 md:space-x-4">
          {specificAvailableTimes.length === 0 ? (
            <p className="text-green-800">No specific available times.</p>
          ) : (
            specificAvailableTimes.map((dateTime: DateTimes) => (
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
                      className="bg-green-200 p-2 rounded-md text-green-900 inline-flex mr-2"
                    >
                      {formatDateTime(timeRange.startDate!)} -{" "}
                      {formatDateTime(timeRange.endDate!)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl md:text-2xl font-bold text-red-600 flex items-center mb-4">
          <FaBan className="mr-2" /> Blocked Out Times
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
    </div>
  );
};

export default Overview;
