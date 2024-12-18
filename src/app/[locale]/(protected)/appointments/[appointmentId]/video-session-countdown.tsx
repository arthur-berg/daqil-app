"use client";
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
  const [isPending, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);

  const t = useTranslations("VideoRoom");

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleCompletion = () => {
    startTransition(async () => {
      try {
        markUserAsShowedUp(appointmentId);
      } catch (error) {
        console.error("Error marking user as showed up:", error);
      }
    });
  };

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

  if (!isHydrated) {
    return <span>{t("timeLeft")}...</span>;
  }

  return (
    <div className="countdown-container">
      <Countdown
        date={new Date(appointmentStartDate)}
        renderer={renderer}
        onComplete={handleCompletion}
      />
    </div>
  );
};

export default VideoSessionCountdown;
