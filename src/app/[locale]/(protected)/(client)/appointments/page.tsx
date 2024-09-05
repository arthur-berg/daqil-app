import { getAppointments } from "@/data/appointment";
import AppointmentList from "./appointment-list";

const ClientAppointmentPage = async () => {
  console.log("FETCHING DATA");

  const appointments = await getAppointments();
  console.log("appointments", appointments);
  return (
    <div className="flex justify-center">
      <AppointmentList appointmentsJson={JSON.stringify(appointments)} />
    </div>
  );
};

export default ClientAppointmentPage;
