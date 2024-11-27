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

  let bookedIntroAppointmentsCount = 0;
  let bookedPaidAppointmentsCount = 0;
  let completedIntroAppointmentsCount = 0;
  let completedPaidAppointmentsCount = 0;
  let canceledIntroAppointmentsCount = 0;
  let canceledPaidAppointmentsCount = 0;

  let noShowBothCount = 0;
  let noShowHostCount = 0;
  let noShowParticipantCount = 0;
  let customCancellationCount = 0;

  const groupedData = clients.reduce((acc: any, client: any) => {
    const registrationDate = format(new Date(client.createdAt), "yyyy-MM-dd");
    if (!acc[registrationDate]) {
      acc[registrationDate] = {
        registeredClients: 0,
        confirmedIntroAppointments: 0,
        confirmedPaidAppointments: 0,
      };
    }
    acc[registrationDate].registeredClients += 1;
    client.appointments?.forEach((apptGroup: any) => {
      apptGroup.bookedAppointments.forEach((appointment: any) => {
        const createdDate = format(
          new Date(appointment.createdAt),
          "yyyy-MM-dd"
        );

        if (!acc[createdDate]) {
          acc[createdDate] = {
            registeredClients: 0,
            confirmedIntroAppointments: 0,
            confirmedPaidAppointments: 0,
          };
        }

        const isIntroAppointment =
          appointment?.appointmentTypeId?.toString() ===
          APPOINTMENT_TYPE_ID_INTRO_SESSION;

        // Confirmed Appointments
        if (appointment?.cancellationReason !== "not-paid-in-time") {
          if (isIntroAppointment) {
            acc[createdDate].confirmedIntroAppointments += 1;
            bookedIntroAppointmentsCount += 1;
          } else {
            acc[createdDate].confirmedPaidAppointments += 1;
            bookedPaidAppointmentsCount += 1;
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
        if (
          appointment?.status === "canceled" &&
          appointment?.status !== "not-paid-in-time"
        ) {
          if (isIntroAppointment) {
            canceledIntroAppointmentsCount += 1;
          } else {
            canceledPaidAppointmentsCount += 1;
          }

          // Count specific cancellation reasons
          const reason = appointment?.cancellationReason;
          if (reason === "no-show-both") {
            noShowBothCount += 1;
          } else if (reason === "no-show-host") {
            noShowHostCount += 1;
          } else if (reason === "no-show-participant") {
            noShowParticipantCount += 1;
          } else if (reason === "custom") {
            customCancellationCount += 1;
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
      <div className="mb-6 p-4 bg-gray-100 rounded-md shadow-md">
        <h2 className="text-xl font-semibold border-b border-gray-300 pb-2 mb-4">
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Clients</p>
            <p className="text-lg font-bold">{totalClients}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Accounts Setup</p>
            <p className="text-lg font-bold">{accountSetupDoneCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Booked Intro Appointments</p>
            <p className="text-lg font-bold">{bookedIntroAppointmentsCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">
              Completed Intro Appointments
            </p>
            <p className="text-lg font-bold">
              {completedIntroAppointmentsCount}
            </p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Canceled Intro Appointments</p>
            <p className="text-lg font-bold">
              {canceledIntroAppointmentsCount}
            </p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Booked Paid Appointments</p>
            <p className="text-lg font-bold">{bookedPaidAppointmentsCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Completed Paid Appointments</p>
            <p className="text-lg font-bold">
              {completedPaidAppointmentsCount}
            </p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Canceled Paid Appointments</p>
            <p className="text-lg font-bold">{canceledPaidAppointmentsCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">No-Show Both Cancellations</p>
            <p className="text-lg font-bold">{noShowBothCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">No-Show Host Cancellations</p>
            <p className="text-lg font-bold">{noShowHostCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">
              No-Show Participant Cancellations
            </p>
            <p className="text-lg font-bold">{noShowParticipantCount}</p>
          </div>
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Custom Cancellations</p>
            <p className="text-lg font-bold">{customCancellationCount}</p>
          </div>
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
              <TableHead>Registered Clients</TableHead>
              <TableHead>Booked Intro Appointments</TableHead>
              <TableHead>Booked Paid Appointments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedData)
              .sort(
                ([dateA], [dateB]) =>
                  new Date(dateB).getTime() - new Date(dateA).getTime()
              )
              .map(([date, data]: any) => (
                <TableRow key={date}>
                  <TableCell>{date}</TableCell>
                  <TableCell>{data.registeredClients}</TableCell>
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
