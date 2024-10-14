import { getClientById } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import GenerateJournalNoteButton from "@/app/[locale]/(protected)/therapist/clients/[clientId]/generate-journal-note-button";

const formatAppointmentTime = (date: any) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ClientPage = async ({ params }: { params: { clientId: string } }) => {
  await connectToMongoDB();
  const clientId = params.clientId;
  const client = await getClientById(clientId);
  const t = await getTranslations("MyClientsPage");

  if (!client) return <div>{t("noClientsFound")}</div>;

  const currentTherapistHistory = client.therapistAppointmentCounts.find(
    (history: any) => history.current
  );
  const pastTherapistsHistory = client.therapistAppointmentCounts.filter(
    (history: any) => !history.current
  );

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
          <strong>{t("email")}:</strong> {client.email}
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
        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0">
          <Link href={`/therapist/clients/${clientId}/schedule-appointment`}>
            <Button className="w-full sm:w-auto">
              {t("scheduleAppointment")}
            </Button>
          </Link>
        </div>
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
                  <strong>{t("therapist")}:</strong>{" "}
                  {await getFullName(
                    history.therapist.firstName,
                    history.therapist.lastName
                  )}{" "}
                  ({history.therapist.email})
                </p>
                <p className="text-gray-800">
                  <strong>{t("therapistAppointments")}:</strong>{" "}
                  {history.appointmentCount}
                </p>
                <p className="text-gray-800">
                  <strong>{t("therapistPeriod")}:</strong>{" "}
                  {history.startDate.toLocaleDateString()} -{" "}
                  {history.endDate?.toLocaleDateString() || t("current")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Display Journal with Appointments */}
      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {t("appointments")}
        </h2>
        <div className="space-y-4">
          {client.appointments.map((appointmentDate: any) => (
            <div key={appointmentDate._id}>
              <h3 className="text-md font-semibold mb-2">
                {new Date(appointmentDate.date).toLocaleDateString()}
              </h3>
              <div className="space-y-4">
                {appointmentDate.bookedAppointments.map(
                  async (appointment: any) => (
                    <div
                      key={appointment._id}
                      className="p-4 border rounded-lg shadow-sm bg-gray-50"
                    >
                      <div className="text-gray-800">
                        <strong>{t("time")}:</strong>{" "}
                        {`${formatAppointmentTime(
                          appointment.startDate
                        )} - ${formatAppointmentTime(appointment.endDate)}`}
                      </div>
                      <div className="text-gray-800">
                        <strong>{t("status")}:</strong> {appointment.status}
                      </div>
                      <div className="text-gray-800">
                        <strong>{t("therapist")}:</strong>{" "}
                        {await getFullName(
                          appointment.hostUserId.firstName,
                          appointment.hostUserId.lastName
                        )}
                      </div>
                      {appointment.journalNoteId && (
                        <div className="mt-4 bg-white border-l-4 border-gray-400 p-4">
                          <strong>{t("journalNote")}:</strong>
                          {appointment.journalNoteId.summarized ? (
                            <>
                              <p>{appointment.journalNoteId.note}</p>
                              <p className="italic text-sm text-gray-600">
                                {t("summary")}:{" "}
                                {appointment.journalNoteId.summary}
                              </p>
                            </>
                          ) : (
                            <div>
                              <GenerateJournalNoteButton
                                journalNoteId={appointment.journalNoteId._id.toString()}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
