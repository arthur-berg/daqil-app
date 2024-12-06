import { getTherapistsWithNextAvailableTime } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import PageTitle from "@/components/page-title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { formatInTimeZone } from "date-fns-tz";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { APPOINTMENT_TYPE_ID_SHORT_SESSION } from "@/contants/config";

const BrowseTherapistsPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  await connectToMongoDB();
  const t = await getTranslations("BookAppointmentPage");

  const user = await getCurrentUser();
  const locale = params.locale;
  const userTimeZone = user?.settings?.timeZone || "UTC";
  const shortAppointmentType = await getAppointmentTypeById(
    APPOINTMENT_TYPE_ID_SHORT_SESSION
  );
  const therapists = await getTherapistsWithNextAvailableTime(
    new Date(),
    userTimeZone,
    shortAppointmentType
  );

  const maxDescriptionLength = 200;

  return (
    <div className="sm:px-10">
      <PageTitle title={t("ourTherapists")} />
      <div className="mb-4">
        <Link href="/book-appointment">
          <Button variant="secondary">{t("goBack")}</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {therapists?.map(async (therapist: any) => (
          <div
            key={therapist.email}
            className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
          >
            <div className="flex flex-col items-center p-6">
              <div className="flex justify-center mt-4">
                <Avatar className="w-28 h-28">
                  <AvatarImage
                    src={therapist?.image || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
                    <Image
                      width={150}
                      height={50}
                      src={
                        locale === "en"
                          ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
                          : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
                      }
                      alt="psychologist-image"
                      className="w-full"
                    />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="font-bold text-lg sm:text-xl mb-4 text-center mt-2">
                {await getFullName(therapist.firstName, therapist.lastName)}
              </div>
              {therapist.therapistWorkProfile && (
                <div className="text-sm text-gray-700 mb-4 text-center">
                  <div className="font-semibold mb-2 text-base sm:text-lg">
                    {therapist.therapistWorkProfile[locale].title}
                  </div>
                  <div className="leading-relaxed">
                    {therapist.therapistWorkProfile[locale].description.length >
                    maxDescriptionLength ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            therapist.therapistWorkProfile[
                              locale
                            ].description.slice(0, maxDescriptionLength) +
                            "...",
                        }}
                      />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            therapist.therapistWorkProfile[locale].description,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              {therapist.nextAvailableSlot && (
                <div className="bg-blue-100 text-blue-800 font-semibold text-sm px-3 py-1 rounded-full mb-2 text-center">
                  {t("nextAvailable")}{" "}
                  {formatInTimeZone(
                    new Date(therapist.nextAvailableSlot),
                    userTimeZone,
                    "eeee, MMMM d, HH:mm"
                  )}
                </div>
              )}
              <Link href={`/therapist/${therapist._id}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("readMore")}
                </Button>
              </Link>
            </div>
            <div className="pb-6">
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
