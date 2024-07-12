import { getAppointments } from "@/actions/appointments";
import AppointmentsList from "@/app/[locale]/(protected)/appointments/appointments-list";

const AppointmentsBody = async () => {
  const appointments = await getAppointments();

  return <AppointmentsList appointments={appointments} />;
};

export default AppointmentsBody;
