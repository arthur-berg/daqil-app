import { getAppointmentTypeById } from "@/data/appointment-types";
import CheckoutWrapper from "./checkout-wrapper";
import { getAppointmentById } from "@/data/appointment";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

const InvoiceCheckoutPage = async ({
  searchParams: { appointmentTypeId, date },
  params: { appointmentId },
}: {
  params: {
    appointmentId: string;
  };
  searchParams: {
    appointmentTypeId: string;
    date: string;
  };
}) => {
  //TODO make sure user is part of appointment participants
  await connectToMongoDB();
  const appointmentType = await getAppointmentTypeById(appointmentTypeId);

  const dateObject = new Date(decodeURIComponent(date));
  const appointment = await getAppointmentById(appointmentId);
  const t = await getTranslations("Checkout");

  if (!appointment) return "No appointment found";

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

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md text-black relative">
      <CheckoutWrapper
        appointmentType={appointmentType}
        appointmentId={appointmentId}
        date={dateObject}
        paymentExpiryDate={appointment.payment.paymentExpiryDate}
      />
    </div>
  );
};

export default InvoiceCheckoutPage;
