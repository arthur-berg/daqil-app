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

  let accountSetupDone = 0;
  let introAppointmentsCount = 0;
  let paidAppointmentsCount = 0;

  const groupedData = clients.reduce((acc: any, client: any) => {
    const createdDate = format(new Date(client.createdAt), "yyyy-MM-dd");

    if (!acc[createdDate]) {
      acc[createdDate] = {
        totalClients: 0,
        accountSetupDone: 0,
        introAppointments: 0,
        paidAppointments: 0,
      };
    }

    acc[createdDate].totalClients += 1;

    if (client.isAccountSetupDone) {
      acc[createdDate].accountSetupDone += 1;
      accountSetupDone += 1;
    }

    const introAppointments = client.appointments?.flatMap((apptGroup: any) =>
      apptGroup.bookedAppointments.filter(
        (appointment: any) =>
          appointment?.appointmentTypeId.toString() ===
            APPOINTMENT_TYPE_ID_INTRO_SESSION &&
          appointment?.status !== "canceled"
      )
    );

    const paidAppointments = client.appointments?.flatMap((apptGroup: any) =>
      apptGroup.bookedAppointments.filter(
        (appointment: any) =>
          appointment?.appointmentTypeId.toString() !==
            APPOINTMENT_TYPE_ID_INTRO_SESSION &&
          appointment?.status !== "canceled"
      )
    );

    if (introAppointments?.length > 0) {
      acc[createdDate].introAppointments += 1;
      introAppointmentsCount += 1;
    }

    if (paidAppointments?.length > 0) {
      acc[createdDate].paidAppointments += 1;
      paidAppointmentsCount += 1;
    }

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
            <strong>Accounts setup:</strong> {accountSetupDone}
          </p>
          <p>
            <strong>Confirmed/Completed Intro Appointments:</strong>{" "}
            {introAppointmentsCount}
          </p>
          <p>
            <strong>Paid Appointments:</strong> {paidAppointmentsCount}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <Link href="/admin/clients">
          <Button variant="secondary">See all clients</Button>
        </Link>
      </div>

      {/* Grouped Data by Date */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Client Data by Date</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Total Clients</TableHead>
              <TableHead>Account setup</TableHead>
              <TableHead>Confirmed/Completed Intro Appointments</TableHead>
              <TableHead>Paid Appointments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData).map(([date, data]: any) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{data.totalClients}</TableCell>
                <TableCell>{data.accountSetupDone}</TableCell>
                <TableCell>{data.introAppointments}</TableCell>
                <TableCell>{data.paidAppointments}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
