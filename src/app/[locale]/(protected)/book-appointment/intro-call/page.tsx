import { getAppointmentById } from "@/data/appointment";
import BookIntroCall from "./book-intro-call";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";

const IntroCallPage = async () => {
  const appointmentType = await getAppointmentById(
    APPOINTMENT_TYPE_ID_INTRO_SESSION
  );
  return (
    <div className="max-w-4xl mx-auto">
      <BookIntroCall appointmentType={appointmentType} />
    </div>
  );
};

export default IntroCallPage;
