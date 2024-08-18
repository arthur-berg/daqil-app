import { getAppointmentTypeById } from "@/data/appointment-types";
import SelectedTherapist from "./selected-therapist";
import { Button } from "@/components/ui/button";

import { getTherapistById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { APPOINTMENT_TYPE_ID } from "@/contants/config";

const BookAppointmentPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const user = await getCurrentUser();

  const selectedTherapist = (
    user?.selectedTherapist
      ? await getTherapistById(user?.selectedTherapist)
      : null
  ) as any;

  const t = await getTranslations("BookAppointmentPage");

  const appointmentType = await getAppointmentTypeById(APPOINTMENT_TYPE_ID);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-center">
          <div className="p-4 max-w-6xl w-full">
            <div className="bg-secondary p-4 rounded-md mb-6">
              <h1 className="text-3xl font-bold text-center text-primary flex-grow">
                {selectedTherapist ? t("yourTherapist") : t("bookAppointment")}
              </h1>
            </div>

            {selectedTherapist ? (
              <SelectedTherapist
                appointmentType={appointmentType}
                selectedTherapistData={JSON.stringify(selectedTherapist)}
                locale={params.locale}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold mb-4">
                    {t("introCallTitle")}
                  </h2>
                  <p className="mb-4">{t("introCallDescription")}</p>
                  <Link href="/book-appointment/intro-call">
                    <Button className="w-full py-4 text-lg">
                      {t("bookIntroCall")}
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-500 mt-2">
                    {t("recommendedForNewClients")}
                  </p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-xl font-bold mb-4">
                    {t("browseTherapistsTitle")}
                  </h2>
                  <p className="mb-4">{t("browseTherapistsDescription")}</p>
                  <Link href="/book-appointment/browse-therapists">
                    <Button className="w-full py-4 text-lg">
                      {t("browseTherapistsButton")}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointmentPage;
