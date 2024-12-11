import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import connectToMongoDB from "@/lib/mongoose";
import { getTherapistInvoicesById } from "@/data/user";
import { format, parseISO } from "date-fns";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { getFullName } from "@/utils/formatName";
import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";

const TherapistInvoicesPage = async () => {
  await connectToMongoDB();
  const t = await getTranslations("TherapistInvoicesPage");
  const user = await getCurrentUser();
  const therapistId = user?.id as string;
  const therapist = await getTherapistInvoicesById(therapistId);

  if (!therapist) return <div>{t("therapistNotFound")}</div>;

  let totalEarnings = 0;
  let totalPaid = therapist.totalAmountPaid || 0;
  let totalBonus = 0;

  // Organize invoices by month
  const groupedInvoices: { [month: string]: any[] } = {};
  const clientsWithIntroAppointments: string[] = [];
  const clientsWithPaidAppointments: string[] = [];

  therapist.appointments.flatMap((appointment: any) =>
    appointment.bookedAppointments.forEach((appt: any) => {
      if (
        appt.status === "completed" &&
        appt.hostUserId.toString() === therapistId
      ) {
        const date = new Date(appt.startDate);
        const monthKey = format(date, "MMMM yyyy");

        if (!groupedInvoices[monthKey]) {
          groupedInvoices[monthKey] = [];
        }

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

        if (
          appt.appointmentTypeId.toString() !==
          APPOINTMENT_TYPE_ID_INTRO_SESSION
        ) {
          groupedInvoices[monthKey].push({
            id: appt._id,
            date: format(date, "yyyy-MM-dd"),
            clientName: getFullName(
              appt.participants[0]?.userId?.firstName,
              appt.participants[0]?.userId?.lastName
            ),
            earnings: (appt.price || 0) * percentage,
          });
        }

        // Track clients with intro and paid appointments
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

        totalEarnings += (appt.price || 0) * percentage;
      }
    })
  );

  // Calculate bonuses
  const clientsWhoConverted = clientsWithIntroAppointments.filter((clientId) =>
    clientsWithPaidAppointments.includes(clientId)
  );
  totalBonus = clientsWhoConverted.length * 25;

  totalEarnings += totalBonus;

  const balanceDue = totalEarnings - totalPaid;

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Earnings Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("earningsOverview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-md text-center">
              <h3 className="text-lg font-bold">{t("totalEarnings")}</h3>
              <p className="text-2xl font-semibold text-blue-600">
                ${totalEarnings.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-md text-center">
              <h3 className="text-lg font-bold">{t("amountReceived")}</h3>
              <p className="text-2xl font-semibold text-green-600">
                ${totalPaid.toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-md text-center">
              <h3 className="text-lg font-bold">{t("bonusEarned")}</h3>
              <p className="text-2xl font-semibold text-purple-600">
                ${totalBonus.toFixed(2)}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-md text-center">
              <h3 className="text-lg font-bold">{t("outstandingBalance")}</h3>
              <p className="text-2xl font-semibold text-yellow-600">
                ${balanceDue.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grouped Invoices */}
      <Separator className="my-6" />
      <h2 className="text-xl font-bold mb-4">{t("invoices")}</h2>
      <div className="overflow-x-auto">
        {Object.keys(groupedInvoices).length === 0 ? (
          <p className="text-center py-4">{t("noInvoices")}</p>
        ) : (
          Object.entries(groupedInvoices).map(([month, invoices]) => {
            const sortedInvoices = invoices.sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            return (
              <div key={month} className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{month}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("client")}</TableHead>
                      <TableHead>{t("earnings")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedInvoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.clientName}</TableCell>
                        <TableCell>${invoice.earnings.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TherapistInvoicesPage;
