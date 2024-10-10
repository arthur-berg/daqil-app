import { MdVideocam, MdVideocamOff } from "react-icons/md";
import { Button } from "@/components/ui/button";
import MuteAudioButton from "./mute-audio-button";

export default function PreviewToolbar({
  hasAudio,
  hasVideo,
  toggleAudio,
  toggleVideo,
  changeAudioSource,
  getAudioSource,
  cameraPublishing,
}: {
  hasAudio: boolean;
  hasVideo: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  changeAudioSource: any;
  getAudioSource: any;
  cameraPublishing: any;
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

      <Button variant="ghost" onClick={toggleVideo}>
        {hasVideo ? (
          <MdVideocam className=" text-white w-8 h-8" />
        ) : (
          <MdVideocamOff className=" text-red-500 w-8 h-8" />
        )}
      </Button>
    </div>
  );
}
