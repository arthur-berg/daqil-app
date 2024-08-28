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
            <button
              onClick={handleEndCall}
              className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full cursor-pointer hover:bg-red-700"
              aria-label="End call"
            >
              <ExitIcon className="w-6 h-6 text-white" />
            </button>
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
