import { getAppointments } from "@/data/appointment";
import AppointmentSwitch from "./appointment-switch";
import connectToMongoDB from "@/lib/mongoose";

const AppointmentsPage = async () => {
  await connectToMongoDB();
  const appointments = await getAppointments();

  return (
    <div className="flex justify-center">
      <AppointmentSwitch appointmentsJson={JSON.stringify(appointments)} />
    </div>
  );
};

export default AppointmentsPage;
