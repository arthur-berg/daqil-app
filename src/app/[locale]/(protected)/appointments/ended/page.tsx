import { Button } from "@/components/ui/button";
import { getCurrentRole } from "@/lib/auth";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";

const EndedAppointmentPage = async () => {
  await connectToMongoDB();
  const t = await getTranslations("AppointmentEndedPage");

  const { isTherapist } = await getCurrentRole();
  return (
    <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center text-white">
      <h1 className="mb-4 text-3xl">{t("callEnded")}</h1>
      <Link href={isTherapist ? `/therapist/appointments` : "/appointments"}>
        <Button variant="secondary">{t("goToAppointments")}</Button>
      </Link>
    </div>
  );
};

export default EndedAppointmentPage;
