import BookingCalendar from "@/app/[locale]/(protected)/therapists/[therapistId]/booking-calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getUserById } from "@/data/user";
import { FaUser } from "react-icons/fa";

const TherapistUserProfile = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  const therapistId = params.therapistId;
  const user = (await getUserById(therapistId)) as any;
  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  if (!user) {
    return "Couldn't find therapist";
  }

  if (!appointmentType) {
    return "Couldn't find appointment type";
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg p-6">
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
              <FaUser className="text-4xl text-gray-500" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-2xl font-bold mb-2">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xl text-gray-600 mb-2">
            {user.workDetails?.title}
          </div>
          <div className="text-gray-700">{user.workDetails?.description}</div>
        </div>
      </div>
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <BookingCalendar
          appointmentType={appointmentType}
          therapistId={therapistId}
        />
        {/* Calendar component will go here */}
      </div>
    </div>
  );
};

export default TherapistUserProfile;
