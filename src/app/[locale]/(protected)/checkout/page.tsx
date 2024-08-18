import { getAppointmentTypeById } from "@/data/appointment-types";
import CheckoutWrapper from "./checkout-wrapper";

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
  const appointmentType = await getAppointmentTypeById(appointmentTypeId);
  const dateObject = new Date(decodeURIComponent(date));

  console.log("therapistId", therapistId);

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-md text-black ">
      <CheckoutWrapper
        appointmentType={appointmentType}
        appointmentId={appointmentId}
        date={dateObject}
        therapistId={therapistId}
      />
    </div>
  );
};

export default CheckoutPage;
