"use client ";
import Countdown from "react-countdown";
import { markUserAsShowedUp } from "@/actions/videoSessions/markUserAsShowedUp";
import { format } from "date-fns";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

const VideoSessionCountdown = ({
  appointmentStartDate,
  appointmentId,
}: {
  appointmentStartDate: Date;
  appointmentId: string;
}) => {
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("VideoRoom");

  const renderer = ({ total, completed }: any) => {
    if (completed) {
      setCountdownCompleted(true);
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

  useEffect(() => {
    if (countdownCompleted) {
      startTransition(() => {
        try {
          markUserAsShowedUp(appointmentId);
        } catch (error) {
          console.error("Error marking user as showed up:", error);
        }
      });
    }
  }, [countdownCompleted, appointmentId]);

  return (
    <div className="countdown-container">
      <Countdown date={new Date(appointmentStartDate)} renderer={renderer} />
    </div>
  );
};

export default VideoSessionCountdown;
