import { useState, useEffect, useTransition } from "react";
import MuteAudioButton from "./mute-audio-button";
import MuteVideoButton from "./mute-video-button";
import EndCallButton from "./end-call-button";
import { useRouter } from "@/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  revalidateTherapistAppointentListCache,
  revalidateBookAppointmentCache,
  revalidateClientAppointentListCache,
} from "@/actions/revalidateBookAppointmentCache";
import { useCurrentRole } from "@/hooks/use-current-role";

const ToolBar = ({
  room,
  connected,
  cameraPublishing,
  t,
  appointmentId,
  isIntroCall,
}: any) => {
  const [isPending, startTransition] = useTransition();
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [areAllMuted, setAllMuted] = useState(false);
  const { isTherapist, isClient } = useCurrentRole();
  const { toast, dismiss } = useToast();
  const [muteToastId, setMuteToastId] = useState<string | null>(null);
  const router = useRouter();

  const toggleVideo = () => {
    if (room && room.camera) {
      const { camera } = room;
      const isVideoEnabled = camera.isVideoEnabled();
      if (isVideoEnabled) {
        camera.disableVideo();
        setHasVideo(false);
      } else {
        camera.enableVideo();
        setHasVideo(true);
      }
    }
  };

  const toggleAudio = () => {
    if (room && room.camera) {
      const camera = room.camera;
      const isAudioEnabled = camera.isAudioEnabled();
      if (isAudioEnabled) {
        camera.disableAudio();
        setHasAudio(false);

        const toastId = toast({
          title: t("micMuted"),
          description: t("micMutedDescription"),
          variant: "warning",
          duration: Infinity,
          position: "top-center",
        }).id;

        setMuteToastId(toastId);
      } else {
        camera.enableAudio();
        setHasAudio(true);

        if (muteToastId) {
          dismiss(muteToastId);
          setMuteToastId(null);
        }
      }
    }
  };

  const changeVideoSource = (videoId: string) => {
    room.camera.setVideoDevice(videoId);
  };
  const changeAudioSource = (audioId: string) => {
    room.camera.setAudioDevice(audioId);
  };

  const endCall = () => {
    if (room) {
      if (isIntroCall) {
        startTransition(() => {
          revalidateBookAppointmentCache();
        });
      }
      startTransition(() => {
        if (isClient) {
          revalidateClientAppointentListCache();
        }
        if (isTherapist) {
          revalidateTherapistAppointentListCache();
        }
      });

      room.leave();
      router.push(`/appointments/ended/${appointmentId}`);
    }
  };

  const getAudioSource = async () => {
    if (room && room.camera) {
      const audioDevice = await room.camera.getAudioDevice();
      return audioDevice.deviceId;
    }
  };

  useEffect(() => {
    if (connected) {
      const isAudioEnabled =
        room && room.camera && room.camera.isAudioEnabled() ? true : false;
      const isVideoEnabled =
        room && room.camera && room.camera.isVideoEnabled() ? true : false;
      setHasAudio(isAudioEnabled);
      setHasVideo(isVideoEnabled);
    }
  }, [connected, room]);

  return (
    <div className="bg-[#41464D] flex justify-center items-center w-full h-[90px] p-4 rounded-md space-x-4">
      <MuteAudioButton
        toggleAudio={toggleAudio}
        hasAudio={hasAudio}
        changeAudioSource={changeAudioSource}
        cameraPublishing={cameraPublishing}
        getAudioSource={getAudioSource}
      />
      <EndCallButton handleEndCall={endCall} />
      <MuteVideoButton
        toggleVideo={toggleVideo}
        hasVideo={hasVideo}
        changeVideoSource={changeVideoSource}
      />
    </div>
  );
};

export default ToolBar;
