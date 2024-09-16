import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";
import { Button } from "@/components/ui/button";

export default function PreviewToolbar({
  hasAudio,
  hasVideo,
  toggleAudio,
  toggleVideo,
}: {
  hasAudio: boolean;
  hasVideo: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
}) {
  return (
    <div className="bg-[#41464D] flex justify-center items-center w-full md:w-3/4 h-[45px] sm:h-[90px] p-4 rounded-md space-x-4 mb-4">
      {/* Toggle Audio */}
      <Button variant="ghost" onClick={toggleAudio}>
        {hasAudio ? (
          <MdMic className=" text-white w-8 h-8" />
        ) : (
          <MdMicOff className=" text-red-500 w-8 h-8" />
        )}
      </Button>

      {/* Toggle Video */}
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
