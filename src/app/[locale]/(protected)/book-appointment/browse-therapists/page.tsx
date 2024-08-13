import { getTherapists } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

const BrowseTherapistsPage = async () => {
  const therapists = await getTherapists();
  const t = await getTranslations("BookAppointmentPage");
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists?.map((therapist: any) => (
          <div
            key={therapist.email}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="font-bold text-xl mb-1">
                {therapist.firstName} {therapist.lastName}
              </div>
              <div className="text-gray-600 mb-4">{therapist.email}</div>
              {therapist.therapistWorkProfile && (
                <div className="text-sm text-gray-700 mb-4">
                  <div className="font-semibold mb-2">
                    {therapist.therapistWorkProfile.title}
                  </div>
                  <div className="leading-relaxed">
                    {therapist.therapistWorkProfile.description}
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-center">
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
