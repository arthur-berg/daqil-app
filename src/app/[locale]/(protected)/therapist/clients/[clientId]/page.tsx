import { getClientById } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/formatName";

const ClientPage = async ({ params }: { params: { clientId: string } }) => {
  const clientId = params.clientId;
  const client = await getClientById(clientId);
  const t = await getTranslations("MyClientsPage");

  if (!client) return <div>No client found</div>;

  const currentTherapistHistory = client.therapistAppointmentCounts.find(
    (history: any) => history.current
  );
  const pastTherapistsHistory = client.therapistAppointmentCounts.filter(
    (history: any) => !history.current
  );

  return (
    <div>
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
          <strong>Email:</strong> {client.email}
        </p>
        <p className="text-gray-700">
          <strong>Current Therapist:</strong>{" "}
          {client.selectedTherapist
            ? `${await getFullName(
                client.selectedTherapist.firstName,
                client.selectedTherapist.lastName
              )}`
            : "None"}
        </p>
        {currentTherapistHistory && (
          <p className="text-gray-700">
            <strong>Total Appointments:</strong>{" "}
            {currentTherapistHistory.appointmentCount}
          </p>
        )}
      </div>

      {/* Display Past Therapist History */}
      {pastTherapistsHistory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Therapist History
          </h2>
          <div className="space-y-4">
            {pastTherapistsHistory.map(async (history: any, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg shadow-sm bg-gray-50"
              >
                <p className="text-gray-800">
                  <strong>Therapist:</strong>{" "}
                  {await getFullName(
                    history.therapist.firstName,
                    history.therapist.lastName
                  )}{" "}
                  ({history.therapist.email})
                </p>
                <p className="text-gray-800">
                  <strong>Appointments:</strong> {history.appointmentCount}
                </p>
                <p className="text-gray-800">
                  <strong>Period:</strong>{" "}
                  {history.startDate.toLocaleDateString()} -{" "}
                  {history.endDate?.toLocaleDateString() || "Current"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0">
        <Link href={`/therapist/clients/${clientId}/schedule-appointment`}>
          <Button className="w-full sm:w-auto">Schedule Appointment</Button>
        </Link>
        {/*  {client.selectedTherapist && (
          <Link href={`/therapist-profile/${client.selectedTherapist._id}`}>
            <Button variant="secondary" className="w-full sm:w-auto">
              View Therapist Profile
            </Button>
          </Link>
        )} */}
      </div>
    </div>
  );
};

export default ClientPage;
