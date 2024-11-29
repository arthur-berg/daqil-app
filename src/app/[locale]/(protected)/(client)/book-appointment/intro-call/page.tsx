import BookIntroCall from "./book-intro-call";
import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import {
  getAppointmentTypeById,
  getAppointmentTypesByIDs,
} from "@/data/appointment-types";
import { getTherapists } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";

const IntroCallPage = async () => {
  await connectToMongoDB();
  const ErrorMessages = await getTranslations("ErrorMessages");

  const therapists = await getTherapists();
  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md p-4">
      <BookIntroCall
        therapistsJson={JSON.stringify(therapists)}
        appointmentTypes={appointmentTypes}
      />
    </div>
  );
};

export default IntroCallPage;
