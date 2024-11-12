import { MdVideocam, MdVideocamOff } from "react-icons/md";
import { Button } from "@/components/ui/button";
import MuteAudioButton from "./mute-audio-button";
import MuteVideoButton from "@/app/[locale]/(protected)/appointments/[appointmentId]/mute-video-button";

export default function PreviewToolbar({
  hasAudio,
  hasVideo,
  toggleAudio,
  toggleVideo,
  changeAudioSource,
  getAudioSource,
  cameraPublishing,
  changeVideoSource,
}: {
  hasAudio: boolean;
  hasVideo: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeAudioSource: any;
  getAudioSource: any;
  cameraPublishing: any;
  changeVideoSource: any;
}) {
  return (
    <div className="bg-[#41464D] flex justify-center items-center w-full  h-[45px] sm:h-[55px] p-4 rounded-md space-x-4 mb-4">
      <MuteAudioButton
        toggleAudio={toggleAudio}
        hasAudio={hasAudio}
        changeAudioSource={changeAudioSource}
        getAudioSource={getAudioSource}
        cameraPublishing={cameraPublishing}
      />

      <MuteVideoButton
        toggleVideo={toggleVideo}
        hasVideo={hasVideo}
        changeVideoSource={changeVideoSource}
      />
    </div>
  );
}
