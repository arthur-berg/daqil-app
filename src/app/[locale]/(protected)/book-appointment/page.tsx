import { getAppointmentTypesByIDs } from "@/data/appointment-types";
import SelectedTherapist from "./selected-therapist";
import { Button } from "@/components/ui/button";
import { getClientByIdAppointments, getTherapistById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import {
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import { redirectUserIfReservationExist } from "./helpers";
import { MdEvent } from "react-icons/md"; // Import the calendar icon from react-icons/md

import IntroCallStepManager from "@/app/[locale]/(protected)/book-appointment/intro-call-step-manager";
import AcceptTherapist from "./accept-therapist";

const BookAppointmentPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  const ErrorMessages = await getTranslations("ErrorMessages");
  const t = await getTranslations("BookAppointmentPage");
  const user = await getCurrentUser();

  if (!user) {
    return ErrorMessages("userNotFound");
  }

  const client = await getClientByIdAppointments(user.id);

  const selectedTherapist = user?.selectedTherapist?.therapist
    ? await getTherapistById(user?.selectedTherapist.therapist)
    : null;

  if (user?.appointments?.length > 0) {
    await redirectUserIfReservationExist(user.id, ErrorMessages);
  }

  const pendingSelectedTherapist =
    user?.selectedTherapist &&
    user?.selectedTherapist.therapist &&
    !user?.selectedTherapist.clientAcceptedTherapist &&
    user?.selectedTherapist.introCallDone;

  const browseTherapists =
    user?.selectedTherapist &&
    user?.selectedTherapist.introCallDone &&
    !user?.selectedTherapist.clientAcceptedTherapist;

  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  const introMeetingIsPending =
    client?.appointments?.some((appointment: any) =>
      appointment.bookedAppointments?.some(
        (bookedAppointment: any) => bookedAppointment.status !== "canceled"
      )
    ) && !user?.selectedTherapist?.introCallDone;

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

            {introMeetingIsPending ? (
              <div className="bg-white p-4 rounded-md mb-6 flex items-center flex-col text-center">
                <MdEvent className="mr-2 text-destructive mb-4" size={48} />
                <p className="text-lg mb-4 flex items-center justify-center">
                  {/* Icon with margin and size */}
                  {t("introMeetingIsPending")}
                </p>
                <Link href="/appointments">
                  <Button className="py-2 text-lg mt-2">
                    {t("seeAppointments")}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {pendingSelectedTherapist ? (
                  <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 mb-6">
                    <h2 className="text-xl font-bold mb-4">
                      {t("awaitingApproval")}
                    </h2>
                    <p className="mb-4">
                      {selectedTherapist?.firstName}{" "}
                      {selectedTherapist?.lastName}
                    </p>
                    <p className="mb-4">
                      {
                        selectedTherapist?.therapistWorkProfile[params.locale]
                          ?.description
                      }
                    </p>
                    <AcceptTherapist />
                  </div>
                ) : browseTherapists ? (
                  <div className="flex justify-center">
                    <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300  w-1/2">
                      <div>
                        <h2 className="text-xl font-bold mb-4">
                          {t("browseTherapistsTitle")}
                        </h2>
                        <p className="mb-4">
                          {t("browseTherapistsDescriptionOnlyOption")}
                        </p>
                      </div>
                      <Link href="/book-appointment/browse-therapists">
                        <Button className="w-full py-4 text-lg mt-auto">
                          {t("browseTherapistsButton")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : selectedTherapist ? (
                  <SelectedTherapist
                    appointmentTypes={appointmentTypes}
                    selectedTherapistData={JSON.stringify(selectedTherapist)}
                    locale={params.locale}
                  />
                ) : (
                  <IntroCallStepManager />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookAppointmentPage;
