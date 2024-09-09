import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTherapistById } from "@/data/user";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { FaUser } from "react-icons/fa";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";

const TherapistPage = async ({
  params,
  searchParams,
}: {
  params: { id: string; locale: string };
  searchParams: { selectedTherapistView?: string };
}) => {
  await connectToMongoDB();

  const therapistId = params.id;
  const locale = params.locale;
  const selectedTherapistView = searchParams.selectedTherapistView;
  const therapist = await getTherapistById(therapistId);
  const t = await getTranslations("TherapistProfilePage");

  if (!therapist) return <div>{t("errorTherapistNotFound")}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md p-6">
      <div className="mb-4 sm:mb-2 flex justify-center sm:justify-start">
        <Button variant="secondary">
          <Link
            href={
              !!selectedTherapistView
                ? "/book-appointment/"
                : "/book-appointment/browse-therapists"
            }
          >
            {!!selectedTherapistView ? t("goBack") : t("goBackBrowse")}
          </Link>
        </Button>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">
        {`${await getFullName(therapist.firstName, therapist.lastName)} `}
      </h1>
      <div className="flex justify-center mb-8">
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
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold">{t("workTitleLabel")}</h2>
          <p className="text-lg text-gray-700">
            {therapist?.therapistWorkProfile?.[locale]?.title ||
              t("noTitleProvided")}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">{t("workDescriptionLabel")}</h2>
          <p className="text-md sm:text-lg text-gray-700 leading-relaxed">
            {therapist?.therapistWorkProfile?.[locale]?.description ||
              t("noDescriptionProvided")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistPage;
