import AppointmentBody from "@/app/[locale]/(protected)/appointments/[appointmentId]/appointment-body";

const AppointmentSessionPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  return <AppointmentBody appointmentId={params.appointmentId} />;
};

export default AppointmentSessionPage;
