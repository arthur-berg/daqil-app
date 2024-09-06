import MyProfileInfo from "./my-profile-info";
import { getCurrentUser } from "@/lib/auth";
import connectToMongoDB from "@/lib/mongoose";

const MyProfileTherapistPage = async () => {
  await connectToMongoDB();

  const therapist = await getCurrentUser();

  if (!therapist) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        <MyProfileInfo therapistJson={JSON.stringify(therapist)} />
      </div>
    </div>
  );
};

export default MyProfileTherapistPage;
