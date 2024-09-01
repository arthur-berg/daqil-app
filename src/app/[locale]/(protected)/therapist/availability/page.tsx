import AvailabilityTabs from "@/app/[locale]/(protected)/therapist/availability/availability-tabs";
import { getAllAppointmentTypes } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

const AvailabilityPage = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.ADMIN]);
  const ErrorMessages = await getTranslations("ErrorMessages");
  if (!user) return <div>{ErrorMessages("userNotFound")}</div>;

  const availableTimes = user.availableTimes;
  const appointmentTypes = await getAllAppointmentTypes();

  if (!appointmentTypes) return;

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
