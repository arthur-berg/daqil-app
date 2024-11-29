import { Separator } from "@/components/ui/separator";
import { getSerializedAppointments } from "@/data/appointment";
import { getTherapistById } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getAppointmentsForDate = (appointments: any[], date: string) => {
  return appointments.filter((appointment: any) => {
    const appointmentDate = format(new Date(appointment.date), "yyyy-MM-dd");
    return appointmentDate === date;
  });
};

const AppointmentDetailsPage = async ({
  params,
}: {
  params: { therapistId: string; appointmentDate: string };
}) => {
  await connectToMongoDB();

  const appointmentDate = decodeURIComponent(params.appointmentDate);

  const therapist = await getTherapistById(params.therapistId);
  if (!therapist) return <div>Therapist not found</div>;

  const filteredAppointments = getAppointmentsForDate(
    therapist.appointments,
    appointmentDate
  );

  const appointments = await getSerializedAppointments(filteredAppointments);

  const completedAppointments = appointments.filter(
    (appointment: any) => appointment.status === "completed"
  );
  const canceledAppointments = appointments.filter(
    (appointment: any) => appointment.status === "canceled"
  );

  // Calculate the total sum for completed appointments
  const totalSum = completedAppointments.reduce(
    (sum: number, appointment: any) =>
      sum + (appointment.appointmentTypeId?.price || 0),
    0
  );

  return (
    <div className="container mx-auto p-6 bg-white">
      {/* Total Sum Block */}
      <div className="bg-green-100 p-4 rounded-md mb-6">
        <h3 className="text-lg font-bold">
          To be paid to psychologist: ${totalSum.toFixed(2)}
        </h3>
      </div>

      <h2 className="text-xl font-bold mb-4">Appointments Details</h2>

      {/* Completed Appointments */}
      <h3 className="text-lg font-bold mb-4">Completed Appointments</h3>
      {completedAppointments.length === 0 ? (
        <p>No completed appointments</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Appointment Type</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedAppointments.map((appointment: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{appointment._id}</TableCell>
                <TableCell>
                  {format(new Date(appointment.startDate), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>
                  {appointment.participants[0]?.firstName.en}{" "}
                  {appointment.participants[0]?.lastName.en}
                </TableCell>
                <TableCell>{appointment.appointmentTypeId?.title}</TableCell>
                <TableCell>${appointment.appointmentTypeId?.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Separator className="my-6" />

      {/* Canceled Appointments */}
      <h3 className="text-lg font-bold mb-4">Canceled Appointments</h3>
      {canceledAppointments.length === 0 ? (
        <p>No canceled appointments</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cancellation Reason</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Appointment Type</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canceledAppointments.map((appointment: any, index: number) => (
              <TableRow key={index}>
                <TableCell>{appointment._id}</TableCell>
                <TableCell>
                  {format(new Date(appointment.startDate), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>{appointment.cancellationReason}</TableCell>
                <TableCell>
                  {appointment.participants[0]?.firstName?.en}{" "}
                  {appointment.participants[0]?.lastName?.en}
                </TableCell>
                <TableCell>{appointment.appointmentTypeId?.title}</TableCell>
                <TableCell>${appointment.appointmentTypeId?.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AppointmentDetailsPage;
