import AvailabilityBody from "@/app/[locale]/(protected)/therapist/availability/availability-body";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { requireAuth } from "@/lib/auth";

const AvailabilityPage = async () => {
  const user = await requireAuth([UserRole.THERAPIST, UserRole.ADMIN]);
  if (!user) return <div>Error: No user found</div>;

  const availableTimes = user.availableTimes;
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  return (
    <div>
      <AvailabilityBody
        availableTimes={availableTimes}
        appointmentType={appointmentType}
      />
    </div>
  );
};

export default AvailabilityPage;
