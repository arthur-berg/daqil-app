import { getAppointmentById } from "@/data/appointment";
import { MdCheckCircle } from "react-icons/md"; // Import a suitable icon
import { format } from "date-fns"; // Assuming you have date-fns installed for date formatting
import { getTranslations } from "next-intl/server";

const BookingConfirmedPage = async ({
  searchParams: { appointmentId },
}: {
  searchParams: { appointmentId: string };
}) => {
  const appointment = await getAppointmentById(appointmentId);
  const formattedStartDate = format(
    new Date(appointment.startDate),
    "MMMM dd, yyyy - h:mm a"
  );
  const formattedEndDate = format(new Date(appointment.endDate), "h:mm a");

  const t = await getTranslations("PaymentSuccessPage");

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
        </div>
        <p className="text-gray-500 mt-4">{t("receiveConfirmation")}</p>
      </div>
    </div>
  );
};

export default BookingConfirmedPage;
