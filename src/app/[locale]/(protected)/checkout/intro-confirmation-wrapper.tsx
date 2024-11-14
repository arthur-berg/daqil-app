"use client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Countdown from "react-countdown";
import { useRouter } from "@/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState, useTransition } from "react";
import { cancelTempReservation } from "@/actions/appointments/cancel-temp-reservation";
import { format } from "date-fns";
import { MdEmail } from "react-icons/md"; // Import email icon

const IntroConfirmationWrapper = ({
  appointmentId,
  paymentExpiryDate,
  date,
  appointmentType,
}: any) => {
  const [reservationExpired, setReservationExpired] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("IntroCheckoutTranslation");
  const router = useRouter();
  const { toast } = useToast();

  const handleCancelTempReservation = useCallback(() => {
    startTransition(async () => {
      const data = await cancelTempReservation(appointmentId);
      if (data.success) {
        router.push("/book-appointment");
      } else if (data.error) {
        toast({ title: data.error, variant: "destructive" });
        if (data.redirect) {
          router.push("/book-appointment");
        }
      }
    });
  }, [appointmentId, router, toast]);

  useEffect(() => {
    if (countdownCompleted) {
      setReservationExpired(true);
    }
  }, [countdownCompleted]);

  useEffect(() => {
    if (reservationExpired) {
      handleCancelTempReservation();
    }
  }, [reservationExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCountdownComplete = useCallback(() => {
    setReservationExpired(true);
    handleCancelTempReservation();
  }, [handleCancelTempReservation]);

  const renderer = useCallback(
    ({ minutes, completed }: any) => {
      if (completed) {
        return null;
      } else {
        return (
          <span className="text-red-600 font-bold">
            {minutes} {t("minutesLeft")}
          </span>
        );
      }
    },
    [t]
  );

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 text-center">
      <div className="flex flex-col items-center mb-6">
        <MdEmail className="text-blue-500 text-6xl mb-2" /> {/* Email icon */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t("actionRequired")}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{t("checkEmailToConfirm")}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {t("appointmentDetails")}
        </h2>
        <p className="text-gray-600">
          <strong>{t("day")}</strong>: {format(date, "eeee, MMMM d, yyyy")}
        </p>
        <p className="text-gray-600">
          <strong>{t("time")}</strong>: {format(date, "HH:mm")}
        </p>
        <p className="text-gray-600">
          <strong>{t("duration")}</strong>: {appointmentType.durationInMinutes}{" "}
          {t("minutes")}
        </p>
      </div>

      {/* Penalty Fee Notice */}
      <div className="text-red-600 font-semibold mb-4">
        {t("cancellationNotice")}
      </div>
      <p className="text-sm text-gray-600 mb-6">{t("cancellationReason")}</p>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-gray-800">
          {t("weHaveReservedNoCard")}
        </p>
        {isPending ? null : (
          <Countdown
            date={paymentExpiryDate}
            renderer={renderer}
            onComplete={handleCountdownComplete}
          />
        )}
      </div>

      <div className="flex justify-center">
        <Button
          disabled={isPending}
          className="mb-4"
          size="lg"
          variant="destructive"
          onClick={handleCancelTempReservation}
        >
          {t("cancelReservation")}
        </Button>
      </div>
    </div>
  );
};

export default IntroConfirmationWrapper;
