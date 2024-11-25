import { getAllClients } from "@/data/user";
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
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";

const AdminDashboardPage = async () => {
  await connectToMongoDB();

  const clients = await getAllClients();

  if (!clients)
    return (
      <div className="container mx-auto p-6 bg-white rounded-md">
        No clients found
      </div>
    );

  const totalClients = clients.length;
  const accountSetupDoneCount = clients.filter(
    (client) => client.isAccountSetupDone
  ).length;

  let confirmedIntroAppointmentsCount = 0;
  let confirmedPaidAppointmentsCount = 0;
  let completedIntroAppointmentsCount = 0;
  let completedPaidAppointmentsCount = 0;
  let canceledIntroAppointmentsCount = 0;
  let canceledPaidAppointmentsCount = 0;

  const groupedData = clients.reduce((acc: any, client: any) => {
    client.appointments?.forEach((apptGroup: any) => {
      apptGroup.bookedAppointments.forEach((appointment: any) => {
        const createdDate = format(
          new Date(appointment.createdAt),
          "yyyy-MM-dd"
        );

        if (!acc[createdDate]) {
          acc[createdDate] = {
            confirmedIntroAppointments: 0,
            confirmedPaidAppointments: 0,
          };
        }

        const isIntroAppointment =
          appointment?.appointmentTypeId?.toString() ===
          APPOINTMENT_TYPE_ID_INTRO_SESSION;

        // Confirmed Appointments
        if (appointment?.status === "confirmed") {
          if (isIntroAppointment) {
            acc[createdDate].confirmedIntroAppointments += 1;
            confirmedIntroAppointmentsCount += 1;
          } else {
            acc[createdDate].confirmedPaidAppointments += 1;
            confirmedPaidAppointmentsCount += 1;
          }
        }

        // Completed Appointments
        if (appointment?.status === "completed") {
          if (isIntroAppointment) {
            completedIntroAppointmentsCount += 1;
          } else {
            completedPaidAppointmentsCount += 1;
          }
        }

        // Canceled Appointments
        if (appointment?.status === "canceled") {
          if (isIntroAppointment) {
            canceledIntroAppointmentsCount += 1;
          } else {
            canceledPaidAppointmentsCount += 1;
          }
        }
      });
    });

    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 bg-white rounded-md">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Summarized Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Key Metrics</h2>
        <div className="space-y-2">
          <p>
            <strong>Total Clients:</strong> {totalClients}
          </p>
          <p>
            <strong>Accounts Setup:</strong> {accountSetupDoneCount}
          </p>
          <p>
            <strong>Booked Intro Appointments:</strong>{" "}
            {confirmedIntroAppointmentsCount}
          </p>
          <p>
            <strong>Completed Intro Appointments:</strong>{" "}
            {completedIntroAppointmentsCount}
          </p>
          <p>
            <strong>Canceled Intro Appointments:</strong>{" "}
            {canceledIntroAppointmentsCount}
          </p>
          <p>
            <strong>Booked Paid Appointments:</strong>{" "}
            {confirmedPaidAppointmentsCount}
          </p>
          <p>
            <strong>Completed Paid Appointments:</strong>{" "}
            {completedPaidAppointmentsCount}
          </p>
          <p>
            <strong>Canceled Paid Appointments:</strong>{" "}
            {canceledPaidAppointmentsCount}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link href="/admin/clients">
          <Button variant="secondary">See all clients</Button>
        </Link>
      </div>

      {/* Grouped Data by Appointment Creation Date */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Confirmed Appointments by Date
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Booked Intro Appointments</TableHead>
              <TableHead>Booked Paid Appointments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).map(([date, data]: any) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{data.confirmedIntroAppointments}</TableCell>
                <TableCell>{data.confirmedPaidAppointments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
