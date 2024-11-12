import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { Link } from "@/navigation";
import { MdEvent } from "react-icons/md";
import IntroCallStepManager from "./intro-call-step-manager";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { getFullName } from "@/utils/formatName";
import AcceptTherapist from "./accept-therapist";

const IntroMeetingManager = async ({
  ErrorMessages,
  client,
  appointmentTypes,
  selectedTherapist,
  t,
  locale,
  isOAuth,
}: {
  ErrorMessages: any;
  client: any;
  appointmentTypes: any;
  selectedTherapist: any;
  t: any;
  locale: string;
  isOAuth?: boolean;
}) => {
  const OAuthAccountNotFinished = !!isOAuth && !client?.isAccountSetupDone;

  const pendingSelectedTherapist =
    client?.selectedTherapist?.clientIntroTherapistSelectionStatus ===
      "PENDING" && client?.selectedTherapist.introCallDone;

  const browseTherapists =
    client?.selectedTherapist?.clientIntroTherapistSelectionStatus ===
      "REJECTED" && client?.selectedTherapist.introCallDone;

  if (!appointmentTypes) {
    return ErrorMessages("appointmentTypeNotExist");
  }

  const introAppointments = client?.appointments
    ?.map((appointment: any) => {
      return appointment.bookedAppointments?.filter(
        (bookedAppointment: any) =>
          bookedAppointment.appointmentTypeId.toString() ===
          APPOINTMENT_TYPE_ID_INTRO_SESSION
      );
    })
    .flat();

  const completedIntroAppointmentFound = introAppointments.some(
    (introAppointment: any) => introAppointment.status === "completed"
  );

  const canceledIntroDueToNoShowAppointmentFound = introAppointments.some(
    (introAppointment: any) => introAppointment.status === "canceled"
  );

  const introAppointmentWasCanceledDueToNoShowUp =
    !completedIntroAppointmentFound && canceledIntroDueToNoShowAppointmentFound;

  const confirmedIntroAppointment = introAppointments?.find(
    (bookedAppointment: any) => bookedAppointment.status === "confirmed"
  );

  const maxDescriptionLength = 200;

  const introMeetingIsBookedButNotFinished =
    !!confirmedIntroAppointment && !client?.selectedTherapist?.introCallDone;

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
            ) : introAppointmentWasCanceledDueToNoShowUp &&
              !introMeetingIsBookedButNotFinished ? (
              <>
                <div className="bg-white p-4 rounded-md mb-6 flex items-center flex-col text-center">
                  <MdEvent className="mr-2 text-destructive mb-4" size={48} />
                  <p className="text-lg mb-4 lg:px-4 flex items-center justify-center">
                    {t("introMeetingWasCanceled")}
                  </p>
                </div>
                <IntroCallStepManager />
              </>
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
                    <div className="flex justify-center mb-4">
                      <Avatar className="w-28 h-28">
                        <AvatarImage
                          src={selectedTherapist?.image || ""}
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
                    <p className="mb-4 font-semibold">
                      {await getFullName(
                        selectedTherapist?.firstName,
                        selectedTherapist?.lastName
                      )}
                    </p>
                    {selectedTherapist.therapistWorkProfile && (
                      <div className="text-sm text-gray-700 mb-4 text-center">
                        <div className="font-semibold mb-2 text-base sm:text-lg">
                          {selectedTherapist.therapistWorkProfile[locale].title}
                        </div>
                        <div className="leading-relaxed">
                          {selectedTherapist.therapistWorkProfile[locale]
                            .description.length > maxDescriptionLength ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  selectedTherapist.therapistWorkProfile[
                                    locale
                                  ].description.slice(0, maxDescriptionLength) +
                                  "...",
                              }}
                            />
                          ) : (
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  selectedTherapist.therapistWorkProfile[locale]
                                    .description,
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    <Link
                      href={`/therapist/${selectedTherapist._id}?selectedTherapistView=true`}
                    >
                      <Button variant="outline" size="sm" className="mb-4">
                        {t("readMore")}
                      </Button>
                    </Link>
                    {/* <p
                      className="mb-4"
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedTherapist?.therapistWorkProfile[locale]
                            ?.description || "",
                      }}
                    ></p> */}
                    <AcceptTherapist
                      therapistId={selectedTherapist._id.toString()}
                    />
                  </div>
                ) : browseTherapists ? (
                  <div className="flex justify-center">
                    <div className="bg-white shadow-lg rounded-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 sm:3/4 md:w-1/2">
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

/*   const isConfirmedAppointmentActiveNow = () => {
    const isOngoing = isWithinInterval(new Date(), {
      start: new Date(confirmedIntroAppointment.startDate),
      end: new Date(confirmedIntroAppointment.endDate),
    });
    return isOngoing;
  };

  const confirmedAppointmentIsCurrentlyOnGoing = confirmedIntroAppointment
    ? isConfirmedAppointmentActiveNow()
    : false; */

/*
introMeetingIsBookedButNotFinished &&
              confirmedAppointmentIsCurrentlyOnGoing ? (
              <div className="bg-white p-4 rounded-md mb-6 flex items-center flex-col text-center">
                <MdEvent className="mr-2 text-destructive mb-4" size={48} />
                <p className="text-lg mb-4 flex items-center justify-center">
                
                  {t("introMeetingIsOngoing", {
                    endDate: formatInTimeZone(
                      new Date(confirmedIntroAppointment.endDate),
                      client.settings.timeZone,
                      "HH:mm"
                    ),
                  })}
                </p>
                <Link href="/appointments">
                  <Button className="py-2 text-lg mt-2">
                    {t("seeAppointments")}
                  </Button>
                </Link>
              </div>
            ) */

export default IntroMeetingManager;
