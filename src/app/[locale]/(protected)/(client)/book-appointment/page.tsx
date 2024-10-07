import { getAppointmentTypesByIDs } from "@/data/appointment-types";
import SelectedTherapist from "./selected-therapist";
import { getClientByIdAppointments, getTherapistById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import {
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import { redirectUserIfReservationExist } from "./helpers";
import connectToMongoDB from "@/lib/mongoose";
import PageTitle from "@/components/page-title";
import IntroMeetingManager from "./intro-meeting-manager";

const BookAppointmentPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  await connectToMongoDB();

  const ErrorMessages = await getTranslations("ErrorMessages");
  const t = await getTranslations("BookAppointmentPage");
  const user = await getCurrentUser();
  const locale = params.locale;

  if (!user) {
    return ErrorMessages("userNotFound");
  }

  const client = await getClientByIdAppointments(user.id);

  if (!client) {
    return ErrorMessages("userNotFound");
  }

  const selectedTherapist = user?.selectedTherapist?.therapist
    ? await getTherapistById(user?.selectedTherapist.therapist)
    : null;

  if (client?.appointments?.length > 0) {
    await redirectUserIfReservationExist(user.id, ErrorMessages);
  }

  const clientAcceptedIntroTherapist =
    user?.selectedTherapist?.clientIntroTherapistSelectionStatus ===
      "ACCEPTED" && user?.selectedTherapist.introCallDone;

  const hasSelectedTherapist = client?.selectedTherapistHistory?.length > 0;
  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  if (clientAcceptedIntroTherapist || hasSelectedTherapist) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-center">
          <div className="max-w-6xl w-full">
            <PageTitle
              title={
                selectedTherapist ? t("yourTherapist") : t("bookAppointment")
              }
            />
            <SelectedTherapist
              appointmentTypes={appointmentTypes}
              selectedTherapistData={JSON.stringify(selectedTherapist)}
              locale={params.locale}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <IntroMeetingManager
      ErrorMessages={ErrorMessages}
      client={client}
      appointmentTypes={appointmentTypes}
      selectedTherapist={selectedTherapist}
      t={t}
      locale={locale}
    />
  );
};

export default BookAppointmentPage;
