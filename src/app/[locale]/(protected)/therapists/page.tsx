import { Button } from "@/components/ui/button";
import { getTherapists } from "@/data/user";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

const TherapistsPage = async () => {
  const therapists = await getTherapists();
  const t = await getTranslations("TherapistsPage");

  return (
    <div className="flex justify-center">
      <div className="p-4 max-w-6xl w-full">
        <div className="bg-secondary p-4 rounded-md mb-6">
          <h1 className="text-3xl font-bold text-center text-primary">
            {t("therapists")}
          </h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {therapists?.map((therapist) => (
            <div
              key={therapist.email}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="font-bold text-xl mb-1">
                  {therapist.firstName} {therapist.lastName}
                </div>
                <div className="text-gray-600 mb-4">{therapist.email}</div>
                {therapist.workDetails && (
                  <div className="text-sm text-gray-700 mb-4">
                    <div className="font-semibold mb-2">
                      {therapist.workDetails.title}
                    </div>
                    <div className="leading-relaxed">
                      {therapist.workDetails.description}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-center">
                  <Link href={`/therapists/${therapist._id}`}>
                    <Button>{t("bookSession")}</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistsPage;
