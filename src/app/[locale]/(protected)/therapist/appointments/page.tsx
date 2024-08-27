import { getAppointments } from "@/data/appointment";
import AppointmentSwitch from "./appointment-switch";

const AppointmentsPage = async () => {
  const appointments = await getAppointments();

  return (
    <div className="flex justify-center">
      <AppointmentSwitch appointmentsJson={JSON.stringify(appointments)} />
    </div>
  );
};

export default AppointmentsPage;
