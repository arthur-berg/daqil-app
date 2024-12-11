import { getTherapistsWithNextAvailableTime } from "@/data/user";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import PageTitle from "@/components/page-title";
import { getCurrentUser } from "@/lib/auth";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { APPOINTMENT_TYPE_ID_SHORT_SESSION } from "@/contants/config";
import TherapistsList from "./therapists-list";

const BrowseTherapistsPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  await connectToMongoDB();
  const t = await getTranslations("BookAppointmentPage");

  const user = await getCurrentUser();
  const userTimeZone = user?.settings?.timeZone || "UTC";
  const shortAppointmentType = await getAppointmentTypeById(
    APPOINTMENT_TYPE_ID_SHORT_SESSION
  );
  const therapists = await getTherapistsWithNextAvailableTime(
    new Date(),
    userTimeZone,
    shortAppointmentType
  );

  return (
    <div className="sm:px-10">
      <PageTitle title={t("ourTherapists")} />
      <div className="mb-4">
        <Link href="/book-appointment">
          <Button variant="secondary">{t("goBack")}</Button>
        </Link>
      </div>
      <TherapistsList therapistsJson={JSON.stringify(therapists)} />
    </div>
  );
};

export default BrowseTherapistsPage;
