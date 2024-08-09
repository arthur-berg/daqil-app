import BlockedOutTimes from "./blocked-out-times";
import NonRecurringTimes from "./non-recurring-times";
import RecurringTimes from "./recurring-times";
import { AvailableTimes } from "@/generalTypes";
import { useTranslations } from "next-intl";

const Overview = ({ availableTimes }: { availableTimes: AvailableTimes }) => {
  const { recurringAvailableTimes } = availableTimes;

  const t = useTranslations("AvailabilityPage");

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  const sortedRecurringAvailableTimes = recurringAvailableTimes.sort(
    (a: any, b: any) =>
      dayOrder.indexOf(a.day.toLowerCase()) -
      dayOrder.indexOf(b.day.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      <RecurringTimes
        recurringAvailableTimes={sortedRecurringAvailableTimes}
        t={t}
      />
      <NonRecurringTimes
        nonRecurringAvailableTimes={availableTimes.nonRecurringAvailableTimes}
        t={t}
      />
      <BlockedOutTimes blockedOutTimes={availableTimes.blockedOutTimes} t={t} />
    </div>
  );
};

export default Overview;
