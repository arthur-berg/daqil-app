import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";
import { getTranslations } from "next-intl/server";

const EndedAppointmentPage = async () => {
  await connectToMongoDB();
  const t = await getTranslations("AppointmentEndedPage");
  return (
    <div className="w-full h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] flex flex-col items-center justify-center text-white">
      <h1 className="mb-4 text-3xl">{t("title")}</h1>
      <Link href="/appointments">
        <Button variant="secondary">{t("goToAppointmentsButton")}</Button>
      </Link>
    </div>
  );
};

export default EndedAppointmentPage;
