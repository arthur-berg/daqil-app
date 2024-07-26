import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getUserById } from "@/data/user";
import { getTranslations } from "next-intl/server";
import { FaUser } from "react-icons/fa";

import BookingCalendar from "@/app/[locale]/(protected)/therapists/[therapistId]/booking-calendar";

const TherapistUserProfile = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  const ErrorMessages = await getTranslations("ErrorMessages");
  const therapistId = params.therapistId;
  const therapist = (await getUserById(therapistId)) as any;
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  if (!therapist) {
    return ErrorMessages("therapistNotExist");
  }

  if (!appointmentType) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg p-6">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={therapist?.image || ""} />
            <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
              <FaUser className="text-4xl text-gray-500" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-bold mb-2">
            {therapist.firstName} {therapist.lastName}
          </div>
          <div className="text-xl text-gray-600 mb-2">
            {therapist.workDetails?.title}
          </div>
          <div className="text-gray-700">
            {therapist.workDetails?.description}
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <BookingCalendar
          therapistsAvailableTimes={JSON.stringify(therapist.availableTimes)}
          appointmentType={appointmentType}
          therapistId={therapistId}
        />
      </div>
    </div>
  );
};

export default TherapistUserProfile;
