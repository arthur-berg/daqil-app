import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExitIcon } from "@radix-ui/react-icons";

export default function EndCallIcon({ handleEndCall }: { handleEndCall: any }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ExitIcon
            className="w-4 h-4 text-white cursor-pointer"
            onClick={handleEndCall}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>End call</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
