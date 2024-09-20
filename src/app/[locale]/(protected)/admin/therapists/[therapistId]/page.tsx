import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getTherapistAdminProfileById } from "@/data/user";
import { format } from "date-fns";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";

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
              <AvatarImage src={therapist.image} alt={therapist.firstName.en} />
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
      <Link href={`/admin/therapists/${therapistId}/availability`}>
        <Button>Therapist&apos;s Availability</Button>
      </Link>
      <div className="flex flex-col justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Appointments Overview</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 w-full sm:w-1/2">Date</th>
              <th className="px-4 py-2 w-full sm:w-1/2">Booked Appointments</th>
            </tr>
          </thead>
          <tbody>
            {therapist.appointments.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-4">
                  No appointments available
                </td>
              </tr>
            ) : (
              therapist.appointments.map((appointment: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 w-full sm:w-1/2">
                    {format(new Date(appointment.date), "yyyy-MM-dd")}
                  </td>
                  <td className="px-4 py-2 w-full sm:w-1/2">
                    {appointment.bookedAppointments.length}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Assigned Clients</h2>
        {therapist.assignedClients.length === 0 ? (
          <p>No clients assigned</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapist.assignedClients.map((client: any, index: number) => (
              <Card key={index} className="mb-4 shadow-lg">
                <CardHeader className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {client.firstName?.en || "Client"}{" "}
                      {client.lastName?.en || index + 1}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Client ID:</strong> {client._id}
                    </p>
                    <p>
                      <strong>Phone Number:</strong>{" "}
                      {client.personalInfo?.phoneNumber || "Not Provided"}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{" "}
                      {format(new Date(client.updatedAt), "yyyy-MM-dd")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistPage;
