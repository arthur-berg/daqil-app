import { getPatients } from "@/actions/appointments";
import CreateAppointmentForm from "@/app/[locale]/(protected)/appointments/create/create-appointment-form";
import { getAppointmentTypeById } from "@/data/appointment-types";

const appointmentTypeId = "6692b4919a6b12347d0afac4";

const AppointmentsCreatePage = async () => {
  const [patients, appointmentType] = await Promise.all([
    getPatients(),
    getAppointmentTypeById(appointmentTypeId),
  ]);

  const stringifiedPatients = JSON.parse(JSON.stringify(patients));

  return (
    <CreateAppointmentForm
      patients={stringifiedPatients}
      appointmentType={appointmentType}
    />
  );
};

export default AppointmentsCreatePage;
