import { getAppointmentTypeById } from "@/data/appointment-types";
import CheckoutWrapper from "./checkout-wrapper";
import { getAppointmentById } from "@/data/appointment";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";

const CheckoutPage = async ({
  searchParams: { appointmentId },
}: {
  searchParams: {
    appointmentId: string;
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

  const appointmentType = await getAppointmentTypeById(
    appointment.appointmentTypeId
  );

  const dateObject = new Date(appointment.startDate);

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md text-black relative">
      <CheckoutWrapper
        appointmentType={appointmentType}
        appointmentId={appointmentId}
        date={dateObject}
        therapistId={appointment.hostUserId.toString()}
        paymentExpiryDate={appointment.payment.paymentExpiryDate}
      />
    </div>
  );
};

export default CheckoutPage;
