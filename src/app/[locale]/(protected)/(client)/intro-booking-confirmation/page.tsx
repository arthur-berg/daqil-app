import ConfirmBooking from "./confirm-booking";

const IntroBookingConfirmationPage = async ({
  searchParams: { appointmentId },
}: {
  searchParams: {
    appointmentId: string;
  };
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg mx-auto text-center lg:mt-12">
      <ConfirmBooking appointmentId={appointmentId} />
    </div>
  );
};

export default IntroBookingConfirmationPage;
