"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import useRoom from "@/hooks/use-room";
import { useCurrentUser } from "@/hooks/use-current-user";
/* import useScreenSharing from "@/hooks/use-screen-sharing"; */
import ToolBar from "@/app/[locale]/(protected)/appointments/[appointmentId]/toolbar";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useRouter } from "@/navigation";
import { useUserName } from "@/hooks/use-user-name";
import PreviewToolbar from "@/app/[locale]/(protected)/appointments/[appointmentId]/preview-toolbar";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import VideoSessionCountdown from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-session-countdown";
import { isBefore, isPast } from "date-fns";
import { markUserAsShowedUp } from "@/actions/videoSessions/markUserAsShowedUp";
import { MdErrorOutline } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ScheduleAppointmentForm from "@/app/[locale]/(protected)/therapist/clients/[clientId]/schedule-appointment/schedule-appointment-form";
import BookingCalendar from "@/app/[locale]/(protected)/(client)/book-appointment/[therapistId]/booking-calendar";
const VideoRoom = ({
  sessionData,
  disablePreview,
  appointmentTypes,
}: {
  sessionData:
    | {
        sessionId?: string;
        token?: string;
        appId?: string;
        roomName: string;
        isIntroCall: boolean;
        appointmentData: {
          id: string;
          startDate: Date;
          clientName: string;
          clientPhoneNumber: string;
          clientEmail: string;
          clientId: string;
          therapistId: string;
          therapistsAvailableTimes: string;
          therapistsAppointments: string;
        };
      }
    | { error: string };
  disablePreview: boolean;
  appointmentTypes: any[];
}) => {
  const {
    createCall,
    room,
    participants,
    connected,
    networkStatus,
    cameraPublishing,
    localParticipant,
  } = useRoom();
  /*   const { isScreenSharing, startScreenSharing, stopScreenSharing } =
    useScreenSharing({ room }); */
  const [containerHeight, setContainerHeight] = useState<string>(
    "h-[calc(100vh-90px)]"
  );

  const roomContainer = useRef<any>(null);
  const effectRun = useRef(false);
  const effectRunPreview = useRef(false);
  const previewPublisherRef = useRef<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const user = useCurrentUser();
  const { isClient, isTherapist } = useCurrentRole();
  const { toast } = useToast();
  const { fullName } = useUserName();
  const t = useTranslations("VideoRoom");
  const router = useRouter();
  const locale = useLocale();

  const userName = fullName;

  const [isPreviewing, setIsPreviewing] = useState(
    disablePreview ? false : true
  );
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isDisconnected, setDisconnected] = useState(false);

  const handleJoinCall = () => {
    setIsPreviewing(false);
    if ("appointmentData" in sessionData) {
      const appointmentStartDate = new Date(
        sessionData?.appointmentData?.startDate
      );
      if (
        isPast(appointmentStartDate) ||
        appointmentStartDate.getTime() === new Date().getTime()
      ) {
        startTransition(async () => {
          try {
            markUserAsShowedUp(sessionData.appointmentData.id);
          } catch (error) {
            console.error("Error marking user as showed up:", error);
          }
        });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const isIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isLandscape = window.innerWidth > window.innerHeight;

      setIsLandscape(isLandscape);

      if (isLandscape) {
        if (isPreviewing) {
          setContainerHeight("h-[calc(100vh+180px)]");
        } else {
          if (isIphone) {
            setContainerHeight("h-[calc(100vh-40px)]");
          } else {
            setContainerHeight("h-[100vh]");
          }
        }
      } else {
        if (isIphone) {
          setContainerHeight("h-[calc(100vh-110px)]");
        } else {
          setContainerHeight("h-[100vh]");
        }
      }
    };

    const handleOrientationChange = () => {
      const isIphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscape);

      if (isLandscape) {
        if (isPreviewing) {
          setContainerHeight("h-[calc(100vh+180px)]");
        } else {
          if (isIphone) {
            setContainerHeight("h-[calc(100vh-40px)]");
          } else {
            setContainerHeight("h-[100vh]");
          }
        }
      } else {
        handleResize();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isPreviewing]);

  useEffect(() => {
    console.log("Parent re-rendered");
  });

  const logoSrc =
    locale === "en"
      ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-white-v2-en.png"
      : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-white-ar.png";

  useEffect(() => {
    const startPreview = async () => {
      const VideoExpress = await import("@vonage/video-express");
      previewPublisherRef.current = new VideoExpress.PreviewPublisher(
        "previewContainer"
      );

      try {
        await previewPublisherRef.current.previewMedia({
          targetElement: "previewContainer",

          publisherProperties: {
            resolution: "1280x720",
            fitMode: "cover",
            insertMode: "replace",
            width: "100%",
            publishAudio: hasAudio,
            publishVideo: hasVideo,
            height: "100%",
            insertDefaultUI: true,
          },
        });
      } catch (err) {
        console.error("Preview failed", err);
        toast({
          variant: "destructive",
          title: "Unable to access camera or microphone",
        });
      }
    };

    if (isPreviewing && !effectRunPreview.current) {
      startPreview();
      effectRunPreview.current = true;
    }

    return () => {
      const previewContainer = document.getElementById("previewContainer");
      if (previewContainer) previewContainer.innerHTML = "";
      if (previewPublisherRef.current) {
        previewPublisherRef.current.destroy();
      }
    };
  }, [isPreviewing, toast]); // eslint-disable-line

  useEffect(() => {
    if (!isPreviewing && sessionData && !effectRun.current) {
      if ("error" in sessionData) {
        toast({ variant: "destructive", title: sessionData.error });
        const redirectUrl = isClient
          ? "/appointments"
          : "/therapist/appointments";
        router.push(redirectUrl);
        return;
      }
      effectRun.current = true;
      const credentials = {
        appId: sessionData.appId,
        sessionId: sessionData.sessionId,
        token: sessionData.token,
      } as any;
      createCall(
        credentials,
        roomContainer.current,
        userName,
        sessionData.appointmentData.id
      );
    }

    return () => {
      if (room) {
        const selfVideoContainer = document.querySelector(
          "div[style*='bottom: 162px;']"
        );
        if (selfVideoContainer) {
          selfVideoContainer.remove();
        }

        setDisconnected(true);
        console.log("LeaveRoom triggered", new Error().stack);

        room.leave();
      }
    };
  }, [
    createCall,
    sessionData,
    user,
    userName,
    room,
    isClient,
    router,
    toast,
    isPreviewing,
  ]);

  if ("error" in sessionData) return;

  const startDate = new Date(sessionData.appointmentData.startDate);

  const meetingHasNotStarted = isBefore(new Date(), startDate);

  if (isPreviewing) {
    return (
      <div
        className={`${containerHeight} md:h-screen w-full flex flex-col justify-between items-center p-2 box-border`}
      >
        <div className="flex justify-center mb-4"></div>
        <div className="flex flex-col flex-grow justify-center items-center w-full">
          <div className="w-full h-full md:max-w-5xl bg-[#20262D] rounded-md overflow-hidden relative">
            <Image
              src={logoSrc}
              alt="daqil-logo"
              width={300}
              height={200}
              className="absolute top-2 right-2 w-[120px] lg:w-[150px] z-10"
            />
            <div id="previewContainer" className="w-full h-full"></div>
          </div>
          <div className="bg-[#2C3036] text-center text-sm text-white mb-4 p-4 rounded-lg shadow-md max-w-lg">
            <span className="font-bold">{t("previewRoom")}</span>{" "}
            {t("testSetup")}
          </div>
          <div className="flex justify-center">
            <PreviewToolbar
              toggleAudio={() => {
                setHasAudio((prev) => {
                  const newState = !prev;
                  if (previewPublisherRef.current) {
                    if (!newState) {
                      previewPublisherRef.current.disableAudio();
                    }
                    if (newState) {
                      previewPublisherRef.current.enableAudio();
                    }
                  }
                  return newState;
                });
              }}
              toggleVideo={() => {
                setHasVideo((prev) => {
                  const newState = !prev;
                  if (previewPublisherRef.current) {
                    if (!newState) {
                      previewPublisherRef.current.disableVideo();
                    }
                    if (newState) {
                      previewPublisherRef.current.enableVideo();
                    }
                  }
                  return newState;
                });
              }}
              changeAudioSource={(audioDeviceId: any) => {
                if (previewPublisherRef.current) {
                  previewPublisherRef.current.setAudioDevice(audioDeviceId);
                }
              }}
              changeVideoSource={(videoDeviceId: any) => {
                if (previewPublisherRef.current) {
                  previewPublisherRef.current.setVideoDevice(videoDeviceId);
                }
              }}
              getAudioSource={async () => {
                if (previewPublisherRef.current) {
                  const audioDevice =
                    await previewPublisherRef.current.getAudioDevice();
                  return audioDevice.deviceId;
                }
              }}
              hasAudio={hasAudio}
              hasVideo={hasVideo}
              cameraPublishing={cameraPublishing}
            />
          </div>
        </div>

        <div className="w-full p-4 flex justify-center ">
          <Button
            onClick={handleJoinCall}
            size="lg"
            className="w-full sm:w-auto h-14"
          >
            {t("joinMeeting")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerHeight} md:h-screen w-full flex flex-col p-2 box-border`}
    >
      <div
        id="callContainer"
        className="flex flex-col items-center flex-grow w-full overflow-hidden relative md:max-w-7xl mx-auto rounded-md bg-[#20262D]  "
      >
        <div id="roomContainer" className="w-full h-full" ref={roomContainer}>
          {participants.length === 0 && (
            <div className="absolute inset-0 flex justify-center items-center text-white text-lg w-full h-full">
              <div className="flex flex-col items-center mb-[90px] px-4 text-center">
                {networkStatus === "disconnected" || isDisconnected ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-6 bg-red-100 rounded-lg shadow-md text-red-700">
                    <MdErrorOutline size={48} className="text-red-600" />
                    <h2 className="text-xl font-bold">
                      {t("disconnected.title")}
                    </h2>
                    <p className="text-center">
                      {t("disconnected.description")}
                    </p>

                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 z-50"
                      onClick={() => {
                        window.location.assign(
                          `/appointments/${sessionData.appointmentData.id}?disablePreview=true`
                        );
                      }}
                    >
                      {t("disconnected.reloadButton")}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Image
                      src={logoSrc}
                      alt="daqil-logo"
                      width={300}
                      height={200}
                      className="mb-4"
                    />
                    {meetingHasNotStarted && (
                      <VideoSessionCountdown
                        appointmentStartDate={startDate}
                        appointmentId={sessionData.appointmentData.id}
                      />
                    )}

                    {user?.role === "CLIENT" ? (
                      t("waitingForPsychologist")
                    ) : (
                      <>
                        <p className="mb-4">{t("waitingForClient")}</p>
                        <p>{t("noShowMessage")}</p>
                        <p>
                          {t("clientName")}:{" "}
                          {sessionData.appointmentData.clientName}
                        </p>
                        <p>
                          {t("phoneNumber")}:{" "}
                          {sessionData.appointmentData.clientPhoneNumber}
                        </p>
                        <p>
                          {t("email")}:{" "}
                          {sessionData.appointmentData.clientEmail}
                        </p>
                        {/* <div className="mt-4 text-sm text-gray-300">
                      <p>{t("noShowMessage")}</p>
                      <p>
                        <strong>{t("clientName")}:</strong>{" "}
                        {sessionData.appointmentData.clientName}
                      </p>
                      <p>
                        <strong>{t("phoneNumber")}:</strong>{" "}
                        {sessionData.appointmentData.clientPhoneNumber}
                      </p>
                    </div> */}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          <Image
            src={logoSrc}
            alt="daqil-logo"
            width={300}
            height={200}
            className="absolute top-2 right-2 w-[120px] lg:w-[150px] z-10"
          />
        </div>
        {isTherapist && (
          <div className="absolute bottom-24 left-4 z-50">
            <Button onClick={() => setIsDialogOpen(true)}>
              {t("scheduleAppointment")}
            </Button>
          </div>
        )}

        {/* Dialog for Scheduling Appointment */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-11/12 sm:max-w-md max-h-[90vh] overflow-y-auto z-50 p-4">
            <h2 className="text-lg font-semibold mb-4">
              {t("scheduleAppointment")}
            </h2>
            <BookingCalendar
              inVideoCallMode={true}
              showOnlyIntroCalls={false}
              inIntroVideoCall={sessionData.isIntroCall}
              setIsVideoDialogOpen={setIsDialogOpen}
              therapistId={sessionData.appointmentData.therapistId}
              therapistsAvailableTimes={
                sessionData.appointmentData.therapistsAvailableTimes
              }
              clientId={sessionData.appointmentData.clientId}
              appointments={sessionData.appointmentData.therapistsAppointments}
              appointmentTypes={appointmentTypes}
            />
          </DialogContent>
        </Dialog>
        <div className="absolute bottom-0 left-0  w-full md:max-w-7xl">
          <ToolBar
            room={room}
            connected={connected}
            cameraPublishing={cameraPublishing}
            t={t}
            appointmentId={sessionData.appointmentData.id}
            isIntroCall={sessionData.isIntroCall}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
