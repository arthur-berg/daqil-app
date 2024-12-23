import { Button } from "@/components/ui/button";
import { getCurrentRole, getCurrentUser } from "@/lib/auth";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";
import { getAppointmentByIdWithTherapist } from "@/data/appointment";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import {
  getClientById,
  getClientByIdAppointments,
  getUserById,
} from "@/data/user";
import PaymentCard from "@/app/[locale]/(protected)/appointments/ended/[appointmentId]/payment-card";
import { getFullName } from "@/utils/formatName";

const EndedAppointmentPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  await connectToMongoDB();
  const appointmentId = params.appointmentId;

  const t = await getTranslations("AppointmentEndedPage");

  console.log("appointmentId", appointmentId);

  const appointment = await getAppointmentByIdWithTherapist(appointmentId);
  console.log("appointment", appointment);

  if (!appointment) {
    return "No appointment found";
  }

  const isIntroAppointment =
    appointment.appointmentTypeId.toString() ===
    APPOINTMENT_TYPE_ID_INTRO_SESSION;

  const { isTherapist, isClient } = await getCurrentRole();
  const user = await getCurrentUser();

  let client = null;

  if (isClient && user) {
    client = await getClientByIdAppointments(user.id);
  }

  const introAppointmentClientView =
    isIntroAppointment &&
    isClient &&
    client?.selectedTherapist.clientIntroTherapistSelectionStatus === "PENDING";

  const showIntroAppointmentClientViewWithPayment =
    isIntroAppointment &&
    isClient &&
    client?.selectedTherapist.clientIntroTherapistSelectionStatus ===
      "ACCEPTED";

  if (showIntroAppointmentClientViewWithPayment) {
    const allAppointments = client.appointments.flatMap(
      (appointmentDay: any) => appointmentDay.bookedAppointments
    );

    const allAppointmentsToBePaid = allAppointments.filter(
      (appointment: any) => {
        return (
          appointment.payment.status === "pending" &&
          new Date(appointment.payment.paymentExpiryDate) > new Date()
        );
      }
    );

    const nextAppointmentToBePaid = allAppointmentsToBePaid
      .filter(
        (appointment: any) =>
          appointment.payment.status === "pending" &&
          new Date(appointment.payment.paymentExpiryDate) > new Date()
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.payment.paymentExpiryDate).getTime() -
          new Date(b.payment.paymentExpiryDate).getTime()
      )[0];

    if (!nextAppointmentToBePaid) return "No appointment found";
    const nextAppointment = await getAppointmentByIdWithTherapist(
      nextAppointmentToBePaid?._id
    );

    const therapistName = await getFullName(
      nextAppointment.hostUserId.firstName,
      nextAppointment.hostUserId.lastName
    );
    return (
      <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center">
        <PaymentCard
          paymentDeadline={nextAppointment.payment.paymentExpiryDate}
          startDate={nextAppointment.startDate}
          therapistName={therapistName}
          appointmentId={nextAppointment._id.toString()}
          appointmentDuration={nextAppointment.durationInMinutes}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center text-white">
      {introAppointmentClientView ? (
        <div className="bg-white shadow-xl rounded-lg p-8 text-center hover:shadow-2xl transition-shadow duration-300 mb-8 border-primary">
          <h1 className="mb-4 text-4xl font-bold text-black">
            {t("callEnded")}
          </h1>
          <div className="text-center text-black">
            <h2 className="mb-3 text-2xl font-semibold text-red-600">
              {t("nextStep")}
            </h2>
            <p className="mb-6 text-lg max-w-3xl">
              {t("descriptionIntro")}{" "}
              <span className="font-bold text-red-500">
                {t("promoCodeMessage")}
              </span>
            </p>
            <div className="flex justify-center sm:space-x-4 sm:rtl:space-x-reverse flex-col sm:flex-row space-y-3 sm:space-y-0 items-center">
              <Link href="/book-appointment">
                <Button variant="success" size="lg">
                  {t("bookNextAppointmentButton")}
                </Button>
              </Link>
              <Link href={`/appointments/${appointmentId}`}>
                <Button variant="secondary">{t("rejoinMeetingButton")}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold">{t("callEnded")}</h1>
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
