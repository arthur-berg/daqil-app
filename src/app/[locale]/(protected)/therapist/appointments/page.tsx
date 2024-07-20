import { getAppointments } from "@/data/appointment";
import AppointmentList from "./appointment-list";

const AppointmentsPage = async () => {
  const appointments = await getAppointments();

  return (
    <div className="flex justify-center">
      <AppointmentList appointments={appointments} />
    </div>
  );
};

export default AppointmentsPage;
