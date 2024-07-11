import { getAppointments } from "@/actions/appointments";
import AppointmentsList from "@/app/[locale]/(protected)/appointments/appointments-list";

const AppointmentsPage = async () => {
  const appointments = await getAppointments();

  console.log("appointments", appointments);

  return <AppointmentsList appointments={appointments} />;
};

export default AppointmentsPage;
