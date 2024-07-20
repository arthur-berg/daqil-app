import { getClients } from "@/actions/appointments";
import CreateAppointmentForm from "@/app/[locale]/(protected)/appointments/create/create-appointment-form";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";

const AppointmentsCreatePage = async () => {
  const [clients, appointmentType] = await Promise.all([
    getClients(),
    getAppointmentTypeById(APPOINTMENT_TYPE_ID),
  ]);

  const stringifiedClients = JSON.parse(JSON.stringify(clients));

  return (
    <div className="flex justify-center">
      <CreateAppointmentForm
        clients={stringifiedClients}
        appointmentType={appointmentType}
      />
    </div>
  );
};

export default AppointmentsCreatePage;
