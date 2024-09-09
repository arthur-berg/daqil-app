import { getAppointments } from "@/data/appointment";
import AppointmentList from "./appointment-list";
import connectToMongoDB from "@/lib/mongoose";

const ClientAppointmentPage = async () => {
  await connectToMongoDB();

  const appointments = await getAppointments();

  return (
    <div className="flex justify-center">
      <AppointmentList appointmentsJson={JSON.stringify(appointments)} />
    </div>
  );
};

export default ClientAppointmentPage;
