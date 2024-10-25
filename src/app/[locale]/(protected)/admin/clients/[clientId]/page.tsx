import { getClientByIdAppointments } from "@/data/user";
import AppointmentRenderer from "./appointment-renderer";

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
  // Flatten all bookedAppointments across dates
  const allBookedAppointments = client.appointments.flatMap(
    (appointmentDay: any) => appointmentDay.bookedAppointments
  );

  return (
    <div className="container mx-auto py-10 bg-white rounded-md">
      <h1 className="text-2xl font-bold mb-4">{fullName}</h1>
      <p className="text-gray-700 mb-8">{client.email}</p>
      <AppointmentRenderer
        appointmentsJson={JSON.stringify(allBookedAppointments)}
        clientId={clientId}
      />
    </div>
  );
};

export default AdminClientPage;
