"use client";
import Countdown from "react-countdown";
import { markUserAsShowedUp } from "@/actions/videoSessions/markUserAsShowedUp";
import { format } from "date-fns";
import { useTransition } from "react";
import { useTranslations } from "next-intl";

const VideoSessionCountdown = ({
  appointmentStartDate,
  appointmentId,
}: {
  appointmentStartDate: Date;
  appointmentId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("VideoRoom");

  // Handler for when the countdown completes
  const handleCompletion = () => {
    startTransition(async () => {
      try {
        /* await markUserAsShowedUp(appointmentId); */
      } catch (error) {
        console.error("Error marking user as showed up:", error);
      }
    });
  };

  // Renderer function for the Countdown component
  const renderer = ({ total, completed }: any) => {
    if (completed) {
      return null;
    } else {
      const formattedTime = format(new Date(total), "mm:ss");
      return (
        <span>
          {t("timeLeft")} : {formattedTime}
        </span>
      );
    }
  };

  return (
    <div className="countdown-container">
      <Countdown
        date={new Date(appointmentStartDate)}
        renderer={renderer}
        onComplete={handleCompletion} // Use onComplete to handle completion
      />
    </div>
  );
};

export default VideoSessionCountdown;
