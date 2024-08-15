import { getUserById } from "@/data/user";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import ScheduleAppointmentForm from "./schedule-appointment-form";

const ScheduleAppointmentPage = async ({
  params,
}: {
  params: { clientId: string };
}) => {
  const user = await getUserById(params.clientId);
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  if (!user) return "No user found";

  return (
    <ScheduleAppointmentForm
      clientJson={JSON.stringify(user)}
      appointmentType={appointmentType}
    />
  );
};

export default ScheduleAppointmentPage;
