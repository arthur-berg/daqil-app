import { getPatients } from "@/actions/appointments";
import CreateAppointmentForm from "@/app/[locale]/(protected)/appointments/create/create-appointment-form";

const AppointmentsCreatePage = async () => {
  const patients = await getPatients();
  const stringifiedPatients = JSON.parse(JSON.stringify(patients));

  return <CreateAppointmentForm patients={stringifiedPatients} />;
};

export default AppointmentsCreatePage;
