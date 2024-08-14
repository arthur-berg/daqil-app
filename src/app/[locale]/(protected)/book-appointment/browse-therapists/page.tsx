import { getTherapists } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

const BrowseTherapistsPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const locale = params.locale;
  const therapists = await getTherapists();
  const t = await getTranslations("BookAppointmentPage");

  return (
    <div className="px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists?.map((therapist: any) => (
          <div
            key={therapist.email}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center p-6">
              <div className="flex justify-center mt-4">
                {therapist.image ? (
                  <img
                    src={therapist.image}
                    alt={`${therapist.firstName} ${therapist.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="font-bold text-xl mb-1 text-center mt-2">
                {therapist.firstName} {therapist.lastName}
              </div>
              <div className="text-gray-600 mb-4 text-center">
                {therapist.email}
              </div>
              {therapist.therapistWorkProfile && (
                <div className="text-sm text-gray-700 mb-4 text-center">
                  <div className="font-semibold mb-2">
                    {therapist.therapistWorkProfile[locale].title}
                  </div>
                  <div className="leading-relaxed">
                    {therapist.therapistWorkProfile[locale].description}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mt-auto flex justify-center">
                <Link href={`/book-appointment/${therapist._id}`}>
                  <Button>{t("bookSession")}</Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseTherapistsPage;
