import { getAppointments } from "@/data/appointment";
import AppointmentList from "./appointment-list";
import connectToMongoDB from "@/lib/mongoose";

const ClientAppointmentPage = async () => {
  await connectToMongoDB();

  const appointments = await getAppointments();

  return <AppointmentList appointmentsJson={JSON.stringify(appointments)} />;
};

export default ClientAppointmentPage;
