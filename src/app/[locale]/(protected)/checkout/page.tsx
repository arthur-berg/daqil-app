import { getAppointmentTypeById } from "@/data/appointment-types";
import CheckoutWrapper from "./checkout-wrapper";
import { getAppointmentById } from "@/data/appointment";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getClientByIdAppointments } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";

const CheckoutPage = async ({
  searchParams: { appointmentTypeId, date, appointmentId, therapistId },
}: {
  searchParams: {
    appointmentId: string;
    appointmentTypeId: string;
    date: string;
    therapistId: string;
  };
}) => {
  await connectToMongoDB();
  const appointment = await getAppointmentById(appointmentId);
  const t = await getTranslations("Checkout");
  const currentUser = await getCurrentUser();

  if (!currentUser) return "User not found";

  if (!appointment) {
    return "No appointment found";
  }

  const currentDate = new Date();
  const paymentExpiryDate = new Date(appointment.payment.paymentExpiryDate);

  if (currentDate > paymentExpiryDate) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-md text-black ">
        <p className="text-center text-red-600 font-semibold">
          {t("paymentExpired")}
        </p>
      </div>
    );
  }

  const appointmentType = await getAppointmentTypeById(appointmentTypeId);

  const dateObject = new Date(decodeURIComponent(date));

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md text-black ">
      <CheckoutWrapper
        appointmentType={appointmentType}
        appointmentId={appointmentId}
        date={dateObject}
        therapistId={therapistId}
        paymentExpiryDate={appointment.payment.paymentExpiryDate}
      />
    </div>
  );
};

export default CheckoutPage;
