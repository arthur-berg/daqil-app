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
import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
} from "@/contants/config";
import PayButton from "@/app/[locale]/(protected)/admin/therapists/[therapistId]/pay-button";

const TherapistPage = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  await connectToMongoDB();

  const therapistId = params.therapistId;
  const therapist = await getTherapistAdminProfileById(therapistId);
  if (!therapist) return <div>Therapist not found</div>;

  const clientsWithIntroAppointments: string[] = [];
  const clientsWithPaidAppointments: string[] = [];
  let totalSumToPay = 0;

  therapist.appointments.forEach((appointment: any) => {
    appointment.bookedAppointments.forEach((appt: any) => {
      if (
        appt.status === "completed" &&
        appt.hostUserId.toString() === therapistId
      ) {
        let percentage = 0;
        if (
          appt.appointmentTypeId.toString() ===
          APPOINTMENT_TYPE_ID_SHORT_SESSION
        ) {
          percentage = 0.7241; // 72.41%
        } else if (
          appt.appointmentTypeId.toString() === APPOINTMENT_TYPE_ID_LONG_SESSION
        ) {
          percentage = 0.661; // 66.10%
        } else {
          percentage = 0; // Intro sessions or other cases won't contribute to earnings here
        }
        totalSumToPay += appt?.price ? appt?.price * percentage : 0;
        // Add logic for intro/paid conversion calculation
        if (
          appt.appointmentTypeId.toString() ===
          APPOINTMENT_TYPE_ID_INTRO_SESSION
        ) {
          if (
            !clientsWithIntroAppointments.includes(
              appt.participants[0].userId.toString()
            )
          ) {
            clientsWithIntroAppointments.push(
              appt.participants[0].userId.toString()
            );
          }
        } else if (
          appt.appointmentTypeId.toString() ===
            APPOINTMENT_TYPE_ID_SHORT_SESSION ||
          appt.appointmentTypeId.toString() === APPOINTMENT_TYPE_ID_LONG_SESSION
        ) {
          if (
            !clientsWithPaidAppointments.includes(
              appt.participants[0].userId.toString()
            )
          ) {
            clientsWithPaidAppointments.push(
              appt.participants[0].userId.toString()
            );
          }
        }
      }
    });
  });

  const clientsWhoConverted = clientsWithIntroAppointments.filter((clientId) =>
    clientsWithPaidAppointments.includes(clientId)
  );

  console.log("clientsWithIntroAppointments", clientsWithIntroAppointments);
  console.log("clientsWithPaidAppointments", clientsWithPaidAppointments);

  const totalBonus = clientsWhoConverted.length * 25;

  const regularSumToPay = totalSumToPay;

  totalSumToPay = regularSumToPay + totalBonus;

  const totalIntroAppointments = clientsWithIntroAppointments.length;
  const conversionRatio =
    totalIntroAppointments > 0
      ? (clientsWhoConverted.length / totalIntroAppointments) * 100
      : 0;

  return (
    <div className="container mx-auto p-6 bg-white">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={therapist?.image}
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
              {therapist.personalInfo && (
                <>
                  <p>
                    <strong>Date of Birth:</strong>{" "}
                    {format(
                      new Date(therapist.personalInfo?.dateOfBirth),
                      "yyyy-MM-dd"
                    )}
                  </p>
                  <p>
                    <strong>Phone Number:</strong>{" "}
                    {therapist.personalInfo?.phoneNumber}
                  </p>
                </>
              )}
            </div>
            <div>
              <p>
                <strong>Time Zone:</strong> {therapist.settings?.timeZone}
              </p>
              <p>
                <strong>Assigned Clients:</strong>{" "}
                {therapist.assignedClients.length}
              </p>
              <p>
                <strong>Intro/Paid Conversion Ratio:</strong>{" "}
                {conversionRatio.toFixed(2)}%
              </p>
              <div>
                <div className="bg-purple-100 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-bold">Bonus Earned:</h3>
                  <p className="text-2xl font-semibold text-purple-600">
                    ${totalBonus.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-bold">Total Earnings:</h3>
                  <p className="text-2xl font-semibold text-blue-600">
                    ${totalSumToPay.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-bold">Has been paid:</h3>
                  <p className="text-2xl font-semibold text-green-600">
                    ${therapist.totalAmountPaid?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-bold">Outstanding Balance:</h3>
                  <p className="text-2xl font-semibold text-yellow-600">
                    $
                    {(totalSumToPay - (therapist.totalAmountPaid || 0)).toFixed(
                      2
                    )}
                  </p>
                </div>

                <PayButton therapistId={therapistId} />
              </div>
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
