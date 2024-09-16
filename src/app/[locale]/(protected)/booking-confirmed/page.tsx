import { getAppointmentById } from "@/data/appointment";
import { MdCheckCircle } from "react-icons/md";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { formatInTimeZone } from "date-fns-tz";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";

const BookingConfirmedPage = async ({
  searchParams: { appointmentId },
}: {
  searchParams: { appointmentId: string };
}) => {
  await connectToMongoDB();
  const user = await getCurrentUser();

  const appointment = await getAppointmentById(appointmentId);

  const t = await getTranslations("PaymentSuccessPage");

  const userTimeZone = user?.settings?.timeZone || "UTC";

  // Format appointment dates in the user's timezone
  const formattedStartDate = formatInTimeZone(
    new Date(appointment.startDate),
    userTimeZone,
    "MMMM dd, yyyy - HH:mm"
  );

  const formattedEndDate = formatInTimeZone(
    new Date(appointment.endDate),
    userTimeZone,
    "HH:mm"
  );

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto text-center mt-12">
      <div className="flex flex-col items-center">
        <MdCheckCircle className="text-green-500 text-6xl mb-4" />
        <h1 className="text-4xl font-extrabold mb-2">{t("thankYou")}</h1>
        <h2 className="text-2xl mb-6">{t("bookingConfirmed")}</h2>
        <div className="text-lg text-gray-700">
          <p className="mb-2">
            <span className="font-semibold">{t("appointment")}</span>{" "}
            {appointment.title}
          </p>
          <p className="mb-2">
            <span className="font-semibold">{t("date")}</span>{" "}
            {formattedStartDate} - {formattedEndDate}
          </p>
          <p className="mb-2">
            <span className="font-semibold">{t("duration")}</span>{" "}
            {appointment.durationInMinutes} {t("minutes")}
          </p>
          <div>
            <Link href="/appointments">
              <Button>{t("goToAppointments")}</Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-500 mt-4">{t("receiveConfirmation")}</p>
      </div>
    </div>
  );
};

export default BookingConfirmedPage;
