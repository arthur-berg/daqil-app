"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import { MdCheckCircle } from "react-icons/md"; // Warm, positive icon

const PaymentCard = ({
  startDate,
  paymentDeadline,
  appointmentId,
  appointmentDuration,
  therapistName,
}: {
  startDate: any;
  paymentDeadline: any;
  appointmentId: string;
  appointmentDuration: string;
  therapistName: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations("AppointmentList");

  const startDateFormatted = format(new Date(startDate), "P");
  const startTimeFormatted = format(new Date(startDate), "HH:mm");

  useEffect(() => {
    setIsMounted(true); // Set to true when the component mounts
  }, []);

  const countdownRenderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return null;
    } else {
      return (
        <span>
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
      );
    }
  };

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <div className="mb-6 p-4 w-full max-w-md bg-blue-50 border border-blue-200 rounded-lg shadow-md">
      <div className="flex flex-col mb-4">
        <div className="flex items-center mb-4">
          <MdCheckCircle className="text-green-600 w-6 h-6 mr-2" />
          <h2 className="text-xl font-semibold text-blue-800">
            {t("congratulations")}
          </h2>
        </div>

        <p className="mb-6 text-lg text-gray-700">{t("completedIntro")}</p>
        <p className="mb-4 text-md text-gray-600">{t("nextStepsMessage")}</p>
      </div>
      <p className="text-gray-700 mb-4 font-bold">
        {t("nextAppointmentInfo", {
          day: format(new Date(startDate), "EEEE"),
          date: startDateFormatted,
          time: startTimeFormatted,
        })}
        <em>({browserTimeZoneFormatted})</em>
      </p>
      <p className="text-gray-700 mb-2">
        <strong>{t("therapist")}:</strong> {therapistName}
      </p>
      <p className="text-gray-700 mb-2">
        <strong>{t("duration")}:</strong> {appointmentDuration} {t("minutes")}
      </p>
      {/*  <p className="text-gray-700 mb-2">
        <strong>{t("paymentDeadline")}:</strong>{" "}
        {format(paymentDeadline, "P HH:mm")}
      </p> */}
      <div className="mt-4 text-sm text-blue-600">
        {t("timeLeftToPay")}:{" "}
        {isMounted && (
          <Countdown
            date={new Date(paymentDeadline)}
            renderer={countdownRenderer}
          />
        )}
      </div>
      <div className="mt-6 text-center">
        <Link href={`/invoices/${appointmentId}/checkout`}>
          <Button variant="success" className="w-full sm:w-auto">
            {t("completePayment")}
          </Button>
        </Link>
      </div>
    </div>
  );
};
export default PaymentCard;
