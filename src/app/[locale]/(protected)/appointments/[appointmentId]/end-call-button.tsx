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
      <div className="flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <ExitIcon
              className="w-8 h-8 text-white cursor-pointer"
              onClick={handleEndCall}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>End call</p>
          </TooltipContent>
        </Tooltip>
        <div className="w-4 h-4"></div>
      </div>
    </TooltipProvider>
  );
}
