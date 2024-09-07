import BookIntroCall from "./book-intro-call";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getTherapists } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";

const IntroCallPage = async () => {
  await connectToMongoDB();
  const appointmentType = await getAppointmentTypeById(
    APPOINTMENT_TYPE_ID_INTRO_SESSION
  );

  const therapists = await getTherapists();

  if (!appointmentType) return "Cant find appointment type";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md p-4">
      <BookIntroCall
        appointmentType={appointmentType}
        therapists={therapists}
      />
    </div>
  );
};

export default IntroCallPage;
