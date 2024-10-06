import AvailabilityTabs from "@/app/[locale]/(protected)/therapist/availability/availability-tabs";
import { getAllAppointmentTypes } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { isBefore, startOfDay } from "date-fns";
import { getTherapistById, getUserById, getUserByIdLean } from "@/data/user";

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

const AvailabilityWrapper = async ({
  adminPageProps,
}: {
  adminPageProps?: { therapistId: string };
}) => {
  await connectToMongoDB();

  const user = await requireAuth([UserRole.THERAPIST, UserRole.ADMIN]);
  const ErrorMessages = await getTranslations("ErrorMessages");
  if (!user) return <div>{ErrorMessages("userNotFound")}</div>;
  const appointmentTypes = await getAllAppointmentTypes();

  if (!appointmentTypes) return;

  let availableTimes;

  const isTherapist = user.role === UserRole.THERAPIST;

  if (isTherapist) {
    const therapist = (await getUserByIdLean(user.id)) as any;
    availableTimes = filterPastTimes(therapist?.availableTimes);
  }

  if (!!adminPageProps) {
    const therapist = (await getUserByIdLean(
      adminPageProps.therapistId
    )) as any;
    availableTimes = filterPastTimes(therapist?.availableTimes);
  }

  return (
    <div className="lg:10/12 mx-auto">
      <AvailabilityTabs
        adminPageProps={adminPageProps}
        availableTimesJson={JSON.stringify(availableTimes)}
        appointmentTypes={appointmentTypes as any[]}
      />
    </div>
  );
};

export default AvailabilityWrapper;
