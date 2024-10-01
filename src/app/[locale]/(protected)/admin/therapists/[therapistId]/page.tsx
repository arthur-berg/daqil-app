import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getTherapistAdminProfileById } from "@/data/user";
import { format } from "date-fns";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TherapistPage = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  await connectToMongoDB();

  const therapistId = params.therapistId;
  const therapist = await getTherapistAdminProfileById(therapistId);
  if (!therapist) return <div>Therapist not found</div>;

  return (
    <div className="container mx-auto p-6 bg-white">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={therapist.image}
                alt={therapist.firstName.en}
                className="object-cover"
              />
            </Avatar>
            <div>
              <CardTitle>
                {therapist.firstName.en} {therapist.lastName.en}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {therapist.therapistWorkProfile.en.title}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Email:</strong> {therapist.email}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {format(
                  new Date(therapist.personalInfo.dateOfBirth),
                  "yyyy-MM-dd"
                )}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {therapist.personalInfo.phoneNumber}
              </p>
            </div>
            <div>
              <p>
                <strong>Time Zone:</strong> {therapist.settings.timeZone}
              </p>
              <p>
                <strong>Assigned Clients:</strong>{" "}
                {therapist.assignedClients.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <Separator />
      </div>
      <div className="flex justify-center sm:justify-start mb-2">
        <Link href={`/admin/therapists/${therapistId}/availability`}>
          <Button>Therapist&apos;s Availability</Button>
        </Link>
      </div>
      <div className="flex justify-center sm:justify-start mb-2">
        <Link href={`/admin/therapists/${therapistId}/calendar`}>
          <Button>Therapist&apos;s Calendar</Button>
        </Link>
      </div>
      <div className="flex justify-center sm:justify-start">
        <Link href={`/admin/therapists/${therapistId}/profile`}>
          <Button>Therapist&apos;s Profile Details</Button>
        </Link>
      </div>

      <div className="flex flex-col justify-between items-center mb-6">
        <h2 className="text-xl font-bold mt-4">Appointments Overview</h2>
      </div>

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

export default TherapistPage;
