import connectToMongoDB from "@/lib/mongoose";
import AppointmentCalendar from "./appointment-calendar";

const AdminAllAppointmentsPage = async () => {
  await connectToMongoDB();

  return (
    <div className="mx-auto w-full py-10 bg-white rounded-md">
      <AppointmentCalendar />
    </div>
  );
};

export default AdminAllAppointmentsPage;
