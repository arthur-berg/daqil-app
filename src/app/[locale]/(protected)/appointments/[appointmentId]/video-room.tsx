"use client";

import { useEffect, useRef, useState } from "react";
import useRoom from "@/hooks/use-room";
import { useCurrentUser } from "@/hooks/use-current-user";
import useScreenSharing from "@/hooks/use-screen-sharing";
import ToolBar from "@/app/[locale]/(protected)/appointments/[appointmentId]/toolbar";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useRouter } from "@/navigation";
import { useUserName } from "@/hooks/use-user-name";
import PreviewToolbar from "@/app/[locale]/(protected)/appointments/[appointmentId]/preview-toolbar";
import { Button } from "@/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

const VideoRoom = ({
  sessionData,
}: {
  sessionData:
    | {
        sessionId?: string;
        token?: string;
        appId?: string;
        roomName: string;
      }
    | { error: string };
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
  const { isScreenSharing, startScreenSharing, stopScreenSharing } =
    useScreenSharing({ room });
  const roomContainer = useRef<any>(null);
  const effectRun = useRef(false);
  const effectRunPreview = useRef(false);
  const previewPublisherRef = useRef<any>(null);

  const user = useCurrentUser();
  const { isClient } = useCurrentRole();
  const { toast } = useToast();
  const { fullName } = useUserName();
  const t = useTranslations("VideoRoom");
  const router = useRouter();
  const locale = useLocale();

  const userName = fullName;

  const [isPreviewing, setIsPreviewing] = useState(true);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);

  const handleJoinCall = () => {
    setIsPreviewing(false);
  };

  const logoSrc =
    locale === "en"
      ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
      : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png";

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
  }, [isPreviewing, toast]);

  useEffect(() => {
    const updateViewportHeight = () => {
      // Get the viewport height and set it as a CSS custom property
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial call to set the height
    updateViewportHeight();

    // Add event listener to handle resize (e.g., when search bar shows/hides)
    window.addEventListener("resize", updateViewportHeight);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, []);

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
      createCall(credentials, roomContainer.current, userName);
    }

    return () => {
      if (room) {
        const selfVideoContainer = document.querySelector(
          "div[style*='bottom: 162px;']"
        );
        if (selfVideoContainer) {
          selfVideoContainer.remove();
        }
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

  if (isPreviewing) {
    return (
      <div className="h-[calc(100vh-100px)] md:h-screen w-full flex flex-col justify-between items-center p-2 box-border">
        <div className="flex justify-center mb-4">
          <div className="w-[100px] md:w-[110px]">
            <Image
              src={logoSrc}
              alt="daqil-logo"
              width={150}
              height={50}
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex flex-col flex-grow justify-center items-center w-full">
          <div className="w-full h-full md:max-w-5xl bg-[#20262D] rounded-md overflow-hidden relative">
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
              hasAudio={hasAudio}
              hasVideo={hasVideo}
            />
          </div>
        </div>

        {/* Join Meeting Button Fixed at the Bottom */}
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
    <div className="h-[calc(var(--vh, 1vh)*100 - 90px)] md:h-screen w-full flex flex-col p-2 box-border">
      {/* Logo Header */}
      <div className="flex justify-center mb-4">
        <div className="w-[100px] md:w-[110px]">
          <Image
            src={logoSrc}
            alt="daqil-logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </div>
      </div>
      <div
        id="callContainer"
        className="flex flex-col items-center flex-grow w-full overflow-hidden relative md:max-w-7xl mx-auto mb-8"
      >
        <div
          id="roomContainer"
          className="flex-grow bg-[#20262D] overflow-hidden w-full h-full rounded-md"
          ref={roomContainer}
        >
          {participants.length === 0 && (
            <div className="absolute inset-0 flex justify-center items-center text-white text-lg">
              {t("waitingForOtherUser")}
            </div>
          )}
        </div>
        {/* Fix toolbar at the bottom */}
        <div className="absolute bottom-0 left-0  w-full md:max-w-7xl">
          <ToolBar
            roomName={sessionData.roomName}
            room={room}
            participants={participants}
            localParticipant={localParticipant}
            connected={connected}
            cameraPublishing={cameraPublishing}
            isScreenSharing={isScreenSharing}
            startScreenSharing={startScreenSharing}
            stopScreenSharing={stopScreenSharing}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
