import { getUserById } from "@/data/user";
import { APPOINTMENT_TYPE_ID_SHORT_SESSION } from "@/contants/config";
import { getAppointmentTypeById } from "@/data/appointment-types";
import ScheduleAppointmentForm from "./schedule-appointment-form";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";

const ScheduleAppointmentPage = async ({
  params,
}: {
  params: { clientId: string };
}) => {
  await connectToMongoDB();

  const user = await getUserById(params.clientId);
  const appointmentType = await getAppointmentTypeById(
    APPOINTMENT_TYPE_ID_SHORT_SESSION
  );
  const t = await getTranslations("MyClientsPage");

  if (!user) return "No user found";

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 relative">
      <Link href={`/therapist/clients/${params.clientId}`}>
        <Button variant="secondary">{t("goBackToClient")}</Button>
      </Link>
      <ScheduleAppointmentForm
        clientJson={JSON.stringify(user)}
        appointmentType={appointmentType}
      />
    </div>
  );
};

export default ScheduleAppointmentPage;
