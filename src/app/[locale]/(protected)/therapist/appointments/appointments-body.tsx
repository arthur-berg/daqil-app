import AppointmentsList from "@/app/[locale]/(protected)/therapist/appointments/appointments-list";
import { getAppointments } from "@/data/appointment";

const AppointmentsBody = async () => {
  const appointments = await getAppointments();

  return <AppointmentsList appointments={appointments} />;
};

export default AppointmentsBody;
