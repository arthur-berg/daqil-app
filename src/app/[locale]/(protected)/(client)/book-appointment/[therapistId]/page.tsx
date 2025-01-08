import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import {
  getAppointmentTypeById,
  getAppointmentTypesByIDs,
} from "@/data/appointment-types";
import { getTherapistById, getUserById } from "@/data/user";
import { getTranslations } from "next-intl/server";
import { FaUser } from "react-icons/fa";

import { getCurrentUser } from "@/lib/auth";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import BookingCalendar from "./booking-calendar";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import Image from "next/image";

const TherapistUserProfile = async ({
  params,
}: {
  params: { therapistId: string; locale: string };
}) => {
  await connectToMongoDB();

  const ErrorMessages = await getTranslations("ErrorMessages");
  const t = await getTranslations("TherapistProfilePage");
  const therapistId = params.therapistId;
  const user = await getCurrentUser();

  if (!user) return "User not found";
  const therapist = (await getTherapistById(therapistId)) as any;
  const client = await getUserById(user.id);

  const locale = params.locale;

  if (!therapist) {
    return ErrorMessages("therapistNotExist");
  }

  const showOnlyIntroCalls =
    user?.selectedTherapist && user?.selectedTherapist.introCallDone
      ? false
      : true;

  const appointmentTypes = showOnlyIntroCalls
    ? [await getAppointmentTypeById(APPOINTMENT_TYPE_ID_INTRO_SESSION)]
    : await getAppointmentTypesByIDs([
        APPOINTMENT_TYPE_ID_SHORT_SESSION,
        APPOINTMENT_TYPE_ID_LONG_SESSION,
      ]);
  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      <div className="flex justify-start">
        <Link href="/book-appointment/browse-therapists">
          <Button variant="outline">{t("goBack")}</Button>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          {/* Therapist Image or Placeholder */}
          <Avatar className="w-28 h-28">
            <AvatarImage src={therapist?.image || ""} />
            <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
              <Image
                width={150}
                height={50}
                src={
                  locale === "en"
                    ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
                    : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
                }
                alt="psychologist-image"
                className="w-full"
              />
            </AvatarFallback>
          </Avatar>

          <h2 className="text-xl font-bold mb-2">
            {await getFullName(therapist.firstName, therapist.lastName)}
          </h2>
          <p className="text-gray-600 mb-2">
            {therapist.therapistWorkProfile[locale].title}
          </p>
        </div>

        <div className="mt-6 rounded-lg md:p-6 w-full">
          <BookingCalendar
            appointmentTypes={appointmentTypes}
            showOnlyIntroCalls={showOnlyIntroCalls}
            therapistsAvailableTimes={JSON.stringify(therapist.availableTimes)}
            appointments={JSON.stringify(therapist.appointments)}
            therapistId={therapistId}
          />
        </div>
      </div>
    </div>
  );
};

export default TherapistUserProfile;
