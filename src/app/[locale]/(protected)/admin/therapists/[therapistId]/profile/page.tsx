import MyProfileInfo from "@/app/[locale]/(protected)/therapist/my-profile/my-profile-info";
import { getUserByIdLean } from "@/data/user";
import connectToMongoDB from "@/lib/mongoose";

const TherapistProfileAdminPage = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  await connectToMongoDB();
  const therapistId = params.therapistId;

  const therapist = await getUserByIdLean(therapistId);

  if (!therapist) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        <MyProfileInfo
          therapistJson={JSON.stringify(therapist)}
          adminPageProps={{ therapistId }}
        />
      </div>
    </div>
  );
};

export default TherapistProfileAdminPage;
