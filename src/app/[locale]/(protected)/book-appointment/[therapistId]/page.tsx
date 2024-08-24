import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getClientByIdAppointments, getTherapistById } from "@/data/user";
import { getTranslations } from "next-intl/server";
import { FaUser } from "react-icons/fa";

import BookingCalendar from "@/app/[locale]/(protected)/book-appointment/[therapistId]/booking-calendar";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/navigation";

const TherapistUserProfile = async ({
  params,
}: {
  params: { therapistId: string; locale: string };
}) => {
  const ErrorMessages = await getTranslations("ErrorMessages");
  const therapistId = params.therapistId;
  const therapist = (await getTherapistById(therapistId)) as any;
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);
  const locale = params.locale;

  if (!therapist) {
    return ErrorMessages("therapistNotExist");
  }

  if (!appointmentType) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center bg-white shadow-md justify-center rounded-lg p-6">
        <div className="flex flex-col items-center">
          {/* Therapist Image or Placeholder */}
          {therapist.image ? (
            <Avatar className="w-28 h-28">
              <AvatarImage src={therapist.image || ""} />
              <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
                <FaUser className="text-4xl text-gray-500" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <h2 className="text-xl font-bold mb-2">
            {therapist.firstName} {therapist.lastName}
          </h2>
          <p className="text-gray-600 mb-2">
            {therapist.therapistWorkProfile[locale].title}
          </p>
          <p className="text-sm text-gray-700">
            {therapist.therapistWorkProfile[locale].description}
          </p>
        </div>

        <div className="mt-6 rounded-lg p-6 w-full">
          <BookingCalendar
            therapistsAvailableTimes={JSON.stringify(therapist.availableTimes)}
            appointments={JSON.stringify(therapist.appointments)}
            appointmentType={appointmentType}
            therapistId={therapistId}
          />
        </div>
      </div>
    </div>
  );
};

export default TherapistUserProfile;
