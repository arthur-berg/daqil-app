import connectToMongoDB from "@/lib/mongoose";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTherapistAdminProfileById } from "@/data/user";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const TherapistsAllAppointmentPage = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  const therapistId = params.therapistId;
  await connectToMongoDB();

  const therapist = await getTherapistAdminProfileById(therapistId);

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="overflow-x-auto">
        {therapist.appointments.length === 0 ? (
          <p className="text-center py-4">No appointments available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Total Appointments</TableHead>
                <TableHead>Completed Appointments</TableHead>
                <TableHead>Canceled Appointments</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {therapist.appointments.map((appointment: any, index: number) => {
                const totalAppointments = appointment.bookedAppointments.length;
                const completedAppointments =
                  appointment.bookedAppointments.filter(
                    (appt: any) => appt.status === "completed"
                  ).length;
                const canceledAppointments =
                  appointment.bookedAppointments.filter(
                    (appt: any) => appt.status === "canceled"
                  ).length;

                return (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(appointment.date), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{totalAppointments}</TableCell>
                    <TableCell>{completedAppointments}</TableCell>
                    <TableCell>{canceledAppointments}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/therapists/${therapistId}/${encodeURIComponent(
                          format(new Date(appointment.date), "yyyy-MM-dd")
                        )}`}
                      >
                        <Button>See more details</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TherapistsAllAppointmentPage;
