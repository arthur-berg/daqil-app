import { getAppointmentTypeById } from "@/data/appointment-types";
import CheckoutWrapper from "./checkout-wrapper";

const InvoiceCheckoutPage = async ({
  searchParams: { appointmentTypeId, date, appointmentId },
}: {
  searchParams: {
    appointmentId: string;
    appointmentTypeId: string;
    date: string;
  };
}) => {
  const appointmentType = await getAppointmentTypeById(appointmentTypeId);
  const dateObject = new Date(decodeURIComponent(date));

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-md text-black ">
      <CheckoutWrapper
        appointmentType={appointmentType}
        appointmentId={appointmentId}
        date={dateObject}
      />
    </div>
  );
};

export default InvoiceCheckoutPage;
