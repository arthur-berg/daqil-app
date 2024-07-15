import { useState, useEffect } from "react";
import MuteAudioButton from "./mute-audio-button";
import MuteVideoButton from "./mute-video-button";
import EndCallButton from "./end-call-button";
import { useRouter } from "@/navigation";

const ToolBar = ({
  room,
  connected,
  cameraPublishing,
  isScreenSharing,
  startScreenSharing,
  stopScreenSharing,
  participants,
  localParticipant,
  roomName,
}: any) => {
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [areAllMuted, setAllMuted] = useState(false);
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
      } else {
        camera.enableAudio();
        setHasAudio(true);
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
      room.leave();
      router.push(`/appointments/ended`);
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
    <div className="bg-[#41464D] flex justify-center items-center absolute bottom-0 left-0 right-0 h-[90px] m-2 rounded-md space-x-8 mx-4">
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
