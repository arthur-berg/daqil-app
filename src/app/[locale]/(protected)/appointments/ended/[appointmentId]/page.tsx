import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";
import { getAppointmentWithJournalById } from "@/data/appointment";

const EndedAppointmentPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  await connectToMongoDB();
  const appointmentId = params.appointmentId;
  const t = await getTranslations("AppointmentEndedPage");
  const appointment = await getAppointmentWithJournalById(appointmentId);
  if (!appointment) {
    return "No appointment found";
  }
  const clientId = appointment.participants[0].userId;

  return (
    <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="mb-4 text-4xl font-bold text-white">{t("title")}</h1>

      <p className="mb-6 text-lg max-w-3xl text-white">{t("description")}</p>

      <div className="flex flex-col space-y-4 mb-6 items-center">
        <Link href={`/therapist/clients/${clientId}`}>
          <Button variant="success">{t("goToJournalButton")}</Button>
        </Link>
        <Link href={`/appointments/${appointmentId}`}>
          <Button variant="secondary">{t("rejoinMeetingButton")}</Button>
        </Link>
      </div>
    </div>
  );
};

export default EndedAppointmentPage;
