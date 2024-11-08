import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import BlockedOutTimes from "./blocked-out-times";
import NonRecurringTimes from "./non-recurring-times";
import RecurringTimes from "./recurring-times";
import { AvailableTimes } from "@/generalTypes";
import { useTranslations } from "next-intl";

const Overview = ({
  availableTimes,
  appointmentTypes,
}: {
  availableTimes: AvailableTimes;
  appointmentTypes: any[];
}) => {
  const { recurringAvailableTimes } = availableTimes;

  const t = useTranslations("AvailabilityPage");

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  const sortedRecurringAvailableTimes = recurringAvailableTimes.sort(
    (a: any, b: any) =>
      dayOrder.indexOf(a.day.toLowerCase()) -
      dayOrder.indexOf(b.day.toLowerCase())
  );

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-center mb-4">
        <p className="text-gray-600 text-lg">
          {t("timezoneNotice", {
            timeZone: `${browserTimeZoneFormatted}`,
          })}
        </p>
      </div>
      <RecurringTimes
        appointmentTypes={appointmentTypes}
        recurringAvailableTimes={sortedRecurringAvailableTimes}
        t={t}
      />
      <NonRecurringTimes
        appointmentTypes={appointmentTypes}
        nonRecurringAvailableTimes={availableTimes.nonRecurringAvailableTimes}
        t={t}
        overview
      />
      <BlockedOutTimes
        blockedOutTimes={availableTimes.blockedOutTimes}
        t={t}
        overview
      />
    </div>
  );
};

export default Overview;
