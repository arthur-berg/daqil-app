import { Button } from "@/components/ui/button";
import { getCurrentRole } from "@/lib/auth";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";
import { getAppointmentById } from "@/data/appointment";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";

const EndedAppointmentPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  await connectToMongoDB();
  const appointmentId = params.appointmentId;

  const t = await getTranslations("AppointmentEndedPage");

  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    return "No appointment found";
  }

  const isIntroAppointment =
    appointment.appointmentTypeId.toString() ===
    APPOINTMENT_TYPE_ID_INTRO_SESSION;

  const { isTherapist, isClient } = await getCurrentRole();

  const introAppointmentClientView = isIntroAppointment && isClient;

  return (
    <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center text-white">
      <h1 className="mb-4 text-3xl font-bold">{t("callEnded")}</h1>

      {introAppointmentClientView ? (
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold">{t("nextStep")}</h2>
          <p className="mb-6 text-lg max-w-3xl text-white">
            {t("descriptionIntro")}
          </p>
          <div className="flex justify-center sm:space-x-2 sm:rtl:space-x-reverse flex-col sm:flex-row space-y-2 sm:space-y-0 items-center">
            <Link href="/book-appointment">
              <Button variant="success" size="lg">
                {t("therapistSelectButton")}
              </Button>
            </Link>
            <Link href={`/appointments/${appointmentId}`}>
              <Button variant="secondary">{t("rejoinMeetingButton")}</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-6 text-lg max-w-3xl text-white">
            {t("description")}
          </p>
          <div className="flex justify-center sm:space-x-2 sm:rtl:space-x-reverse flex-col sm:flex-row space-y-2 sm:space-y-0 items-center">
            <Link
              href={isTherapist ? `/therapist/appointments` : "/appointments"}
            >
              <Button>{t("goToAppointments")}</Button>
            </Link>
            <Link href={`/appointments/${appointmentId}`}>
              <Button variant="secondary">{t("rejoinMeetingButton")}</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndedAppointmentPage;
