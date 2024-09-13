import AvailabilityTabs from "@/app/[locale]/(protected)/therapist/availability/availability-tabs";
import { getAllAppointmentTypes } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { isBefore, startOfDay } from "date-fns";

const filterPastTimes = (availableTimes: any) => {
  const today = startOfDay(new Date());

  const nonRecurringAvailableTimes =
    availableTimes?.nonRecurringAvailableTimes?.filter((timeSlot: any) => {
      const slotDate = startOfDay(new Date(timeSlot.date));
      return !isBefore(slotDate, today);
    });

  const blockedOutTimes = availableTimes?.blockedOutTimes?.filter(
    (timeSlot: any) => {
      const slotDate = startOfDay(new Date(timeSlot.date));
      return !isBefore(slotDate, today);
    }
  );

  return {
    ...availableTimes,
    nonRecurringAvailableTimes,
    blockedOutTimes,
  };
};

const AvailabilityPage = async () => {
  await connectToMongoDB();
  const user = await requireAuth([UserRole.THERAPIST, UserRole.ADMIN]);
  const ErrorMessages = await getTranslations("ErrorMessages");
  if (!user) return <div>{ErrorMessages("userNotFound")}</div>;

  const appointmentTypes = await getAllAppointmentTypes();

  if (!appointmentTypes) return;

  const availableTimes = filterPastTimes(user?.availableTimes);

  return (
    <div className="lg:10/12 mx-auto">
      <AvailabilityTabs
        availableTimes={availableTimes}
        appointmentTypes={appointmentTypes as any[]}
      />
    </div>
  );
};

export default AvailabilityPage;
