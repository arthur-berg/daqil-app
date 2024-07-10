import { useState, useEffect } from "react";
/* import { useHistory } from "react-router-dom"; */
/* import useMediaQuery from "@material-ui/core/useMediaQuery";
import * as VideoExpress from "@vonage/video-express";
import MuteAudioButton from "components/MuteAudioButton";
import MuteVideoButton from "components/MuteVideoButton"; */
// import SpeakerButton from 'components/SpeakerButton';
/* import SpeakerSelector from "components/SpeakerSelector";
import RecordingButton from "components/RecordingButton";
import LayoutButton from "components/LayoutButton";
import MuteAll from "components/MuteAllButton";
import ReactionsButton from "components/ReactionsButton";
import ScreenSharingButton from "components/ScreenSharingButton"; */
/* import MuteAudioButton from "./mute-audio-button";
import MuteVideoButton from "./mute-video-button"; */
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

  const changeVideoSource = (videoId) => {
    room.camera.setVideoDevice(videoId);
  };
  const changeAudioSource = (audioId) => {
    room.camera.setAudioDevice(audioId);
  };

  const endCall = () => {
    if (room) {
      router.push(`/video/end`);
      room.leave();
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
  /*{" "}
      <MuteVideoButton
        toggleVideo={toggleVideo}
        hasVideo={hasVideo}
        classes={classes}
        changeVideoSource={changeVideoSource}
      />{" "}
      */
  /*{" "}
      <MuteAudioButton
        toggleAudio={toggleAudio}
        hasAudio={hasAudio}
        classes={classes}
        changeAudioSource={changeAudioSource}
      />{" "}
      */

  return (
    <div className="bg-[#41464D] flex justify-center items-center absolute bottom-0 left-0 right-0 h-[90px] m-2 rounded-md">
      <EndCallButton handleEndCall={endCall} />
    </div>
  );
};

export default ToolBar;
