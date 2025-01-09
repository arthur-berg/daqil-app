import { getClientById, getTherapistById } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import { getCurrentUser } from "@/lib/auth";
import ScheduleAppointment from "@/app/[locale]/(protected)/therapist/clients/[clientId]/schedule-appointment";
import { getAppointmentTypesByIDs } from "@/data/appointment-types";
import {
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";

const ClientPage = async ({ params }: { params: { clientId: string } }) => {
  await connectToMongoDB();
  const clientId = params.clientId;
  const client = await getClientById(clientId);
  const t = await getTranslations("MyClientsPage");
  const user = await getCurrentUser();
  if (!user) return "No user found";
  if (!client) return <div>{t("noClientFound")}</div>;
  const therapist = await getTherapistById(user?.id);

  const currentTherapistHistory = client.therapistAppointmentCounts.find(
    (history: any) => history.current
  );
  const pastTherapistsHistory = client.therapistAppointmentCounts.filter(
    (history: any) => !history.current
  );

  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="mb-4 flex items-center flex-col sm:items-start">
        <Link href={`/therapist/clients`}>
          <Button variant="secondary">{t("goBackToClients")}</Button>
        </Link>
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        {await getFullName(client.firstName, client.lastName)}
      </h1>
      <div className="space-y-2 text-center">
        <p className="text-gray-700">
          <strong>{t("emailLabel")}:</strong> {client.email}
        </p>
        <p className="text-gray-700">
          <strong>{t("currentTherapist")}:</strong>{" "}
          {client.selectedTherapist
            ? `${await getFullName(
                client.selectedTherapist.firstName,
                client.selectedTherapist.lastName
              )}`
            : t("none")}
        </p>
        {currentTherapistHistory && (
          <p className="text-gray-700">
            <strong>{t("totalAppointments")}:</strong>{" "}
            {currentTherapistHistory.appointmentCount}
          </p>
        )}
      </div>

      {/* Display Past Therapist History */}
      {pastTherapistsHistory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {t("therapistHistory")}
          </h2>
          <div className="space-y-4">
            {pastTherapistsHistory.map(async (history: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <p className="text-gray-800">
                  <strong>{t("therapistLabel")}:</strong>{" "}
                  {await getFullName(
                    history.therapist.firstName,
                    history.therapist.lastName
                  )}{" "}
                  ({history.therapist.email})
                </p>
                <p className="text-gray-800">
                  <strong>{t("appointmentsLabel")}:</strong>{" "}
                  {history.appointmentCount}
                </p>
                <p className="text-gray-800">
                  <strong>{t("periodLabel")}:</strong>{" "}
                  {history.startDate.toLocaleDateString()} -{" "}
                  {history.endDate?.toLocaleDateString() || t("current")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScheduleAppointment
        clientId={client._id}
        appointmentTypes={appointmentTypes}
        therapistsAvailableTimesJson={JSON.stringify(therapist.availableTimes)}
        appointmentsJson={JSON.stringify(therapist.appointments)}
        therapistId={therapist._id.toString()}
      />
    </div>
  );
};

export default ClientPage;

/*

 appointmentTypes={appointmentTypes}
        showOnlyIntroCalls={false}
        therapistsAvailableTimes={JSON.stringify(therapist.availableTimes)}
        clientId={client._id.toString()}
        appointments={JSON.stringify(therapist.appointments)}
        therapistId={therapist._id.toString()}
        payLaterMode={true}
        inIntroVideoCall={false}
        smallSelect*/
