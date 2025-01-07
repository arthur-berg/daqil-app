import { getClientByIdAppointments } from "@/data/user";
import AppointmentRenderer from "./appointment-renderer";

const questionsMap: Record<string, string> = {
  question1: "What is the reason for booking a call with us?",
  question2: "Please describe your symptoms.",
  question3: "How long have you been experiencing these symptoms?",
  question4:
    "Is there anything else you would like to share with your psychologist before the call?",
};

const AdminClientPage = async ({
  params,
}: {
  params: { clientId: string };
}) => {
  const clientId = params.clientId;
  const client = await getClientByIdAppointments(clientId);

  if (!client) {
    return <div>Client not found</div>;
  }

  const fullName = `${client.firstName?.en} ${client.lastName?.en}`;
  const allBookedAppointments = client.appointments.flatMap(
    (appointmentDay: any) => appointmentDay.bookedAppointments
  );

  const introQuestions = client.introAnswers
    ? Object.keys(client.introAnswers)
    : null;

  return (
    <div className="container mx-auto py-10 bg-white rounded-md shadow-md px-6">
      <h1 className="text-2xl font-bold mb-4">{fullName}</h1>
      <p className="text-gray-600 mb-8">{client.email}</p>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Intro Answers
        </h2>
        <ul className="space-y-2">
          {introQuestions ? (
            <>
              {introQuestions?.map((question, index) => (
                <li key={index} className="bg-gray-50 p-2 rounded-md shadow-sm">
                  <span className="font-medium">{questionsMap[question]}:</span>{" "}
                  <span className="text-gray-700">
                    {client.introAnswers[question]}
                  </span>
                </li>
              ))}
            </>
          ) : (
            <p>No intro answers found.</p>
          )}
        </ul>
      </div>

      <AppointmentRenderer
        appointmentsJson={JSON.stringify(allBookedAppointments)}
        clientId={clientId}
      />
    </div>
  );
};

export default AdminClientPage;
