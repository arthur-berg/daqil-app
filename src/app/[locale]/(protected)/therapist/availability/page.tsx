import AvailabilityTabs from "@/app/[locale]/(protected)/therapist/availability/availability-tabs";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";

const AvailabilityPage = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.ADMIN]);
  const ErrorMessages = await getTranslations("ErrorMessages");
  if (!user) return <div>{ErrorMessages("userNotFound")}</div>;

  const availableTimes = user.availableTimes;
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  return (
    <div className="md:w-10/12 mx-auto">
      <AvailabilityTabs
        availableTimes={availableTimes}
        appointmentType={appointmentType}
      />
    </div>
  );
};

export default AvailabilityPage;
