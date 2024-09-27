import { getAppointmentTypesByIDs } from "@/data/appointment-types";
import SelectedTherapist from "./selected-therapist";
import { Button } from "@/components/ui/button";
import { getClientByIdAppointments, getTherapistById } from "@/data/user";
import { getCurrentUser } from "@/lib/auth";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";
import {
  APPOINTMENT_TYPE_ID_INTRO_SESSION,
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import { redirectUserIfReservationExist } from "./helpers";
import { MdEvent } from "react-icons/md";

import AcceptTherapist from "./accept-therapist";
import { getFullName } from "@/utils/formatName";
import connectToMongoDB from "@/lib/mongoose";
import IntroCallStepManager from "./intro-call-step-manager";
import PageTitle from "@/components/page-title";

const BookAppointmentPage = async ({
  params,
}: {
  params: { locale: string };
}) => {
  await connectToMongoDB();

  const ErrorMessages = await getTranslations("ErrorMessages");
  const t = await getTranslations("BookAppointmentPage");
  const user = await getCurrentUser();

  const OAuthAccountNotFinished = !!user?.isOAuth && !user?.isAccountSetupDone;

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
    user?.selectedTherapist?.clientIntroTherapistSelectionStatus ===
      "PENDING" && user?.selectedTherapist.introCallDone;

  const browseTherapists =
    user?.selectedTherapist?.clientIntroTherapistSelectionStatus ===
      "REJECTED" && user?.selectedTherapist.introCallDone;

  // TODO - Sida / Text för ifall användaren har en intro session som är klar och fick status "canceled"

  // Into meeting was canceled due to host did not show up or similar

  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  const introAppointments = client?.appointments?.map((appointment: any) => {
    return appointment.bookedAppointments?.filter(
      (bookedAppointment: any) =>
        bookedAppointment.appointmentTypeId ===
        APPOINTMENT_TYPE_ID_INTRO_SESSION
    );
  });

  const completedIntroAppointmentFound = introAppointments.some(
    (introAppointment: any) => introAppointment.status === "completed"
  );

  const canceledIntroDueToNoShowAppointmentFound = introAppointments.some(
    (introAppointment: any) =>
      introAppointment.status === "canceled" &&
      (introAppointment.cancellationReason === "no-show-both" ||
        introAppointment.cancellationReason === "no-show-host" ||
        introAppointment.cancellationReason === "no-show-participant")
  );

  const introAppointmentWasCanceledDueToNoShowUp =
    !completedIntroAppointmentFound && canceledIntroDueToNoShowAppointmentFound;
  console.log("introAppointments", introAppointments);
  console.log(
    "canceledIntroDueToNoShowAppointmentFound",
    canceledIntroDueToNoShowAppointmentFound
  );

  console.log("completedIntroAppointmentFound", completedIntroAppointmentFound);

  console.log(
    "introAppointmentWasCanceledDueToNoShowUps",
    introAppointmentWasCanceledDueToNoShowUp
  );

  const introMeetingIsBookedButNotFinished =
    client?.appointments?.some((appointment: any) =>
      appointment.bookedAppointments?.some(
        (bookedAppointment: any) => bookedAppointment.status !== "canceled"
      )
    ) && !user?.selectedTherapist?.introCallDone;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="relative flex justify-center">
          <div className="max-w-6xl w-full">
            <PageTitle
              title={
                selectedTherapist ? t("yourTherapist") : t("bookAppointment")
              }
            />

            {OAuthAccountNotFinished ? (
              <div className="bg-white p-4 rounded-md mb-6 flex items-center flex-col text-center">
                <MdEvent className="mr-2 text-destructive mb-4" size={48} />
                <p className="text-lg mb-4 flex items-center justify-center">
                  {t("oauthAccountNotFinishedMessage")}
                </p>
                <Link href="/oauth-account-setup">
                  <Button className="py-2 text-lg mt-2">
                    {t("finishAccountSetupButton")}
                  </Button>
                </Link>
              </div>
            ) : introAppointmentWasCanceledDueToNoShowUp ? (
              <div className="bg-white p-4 rounded-md mb-6 flex items-center flex-col text-center">
                <MdEvent className="mr-2 text-destructive mb-4" size={48} />
                <p className="text-lg mb-4 flex items-center justify-center">
                  Your appointment was canceled because one or both participants
                  didn&apos;t connect. Please book a new intro call.
                </p>
                <IntroCallStepManager />
              </div>
            ) : introMeetingIsBookedButNotFinished ? (
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
                      {await getFullName(
                        selectedTherapist?.firstName,
                        selectedTherapist?.lastName
                      )}
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
