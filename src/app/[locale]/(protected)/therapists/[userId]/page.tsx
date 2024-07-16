import BookingCalendar from "@/app/[locale]/(protected)/therapists/[userId]/booking-calendar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserById } from "@/data/user";
import { FaUser } from "react-icons/fa";

const TherapistUserProfile = async ({
  params,
}: {
  params: { userId: string };
}) => {
  const userId = params.userId;
  const user = (await getUserById(userId)) as any;

  if (!user) {
    return "Couldn't find therapist";
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
            {user.userDescription?.title}
          </div>
          <div className="text-gray-700">
            {user.userDescription?.description}
          </div>
        </div>
      </div>
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Calendar</h2>
        <BookingCalendar />
        {/* Calendar component will go here */}
      </div>
    </div>
  );
};

export default TherapistUserProfile;
