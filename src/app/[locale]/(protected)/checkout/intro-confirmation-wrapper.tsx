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
import IntroQuestionsForm from "@/app/[locale]/(protected)/checkout/intro-questions-form";
import { sendIntroConfirmationMail } from "@/actions/appointments/send-intro-confirmation-mail";

const IntroConfirmationWrapper = ({
  appointmentId,
  paymentExpiryDate,
  date,
  appointmentType,
  therapistId,
}: any) => {
  const [reservationExpired, setReservationExpired] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("IntroCheckoutTranslation");
  const router = useRouter();
  const { toast } = useToast();
  const [showQuestionsForm, setShowQuestionsForm] = useState(true); // Add state to toggle view
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleFormCompletion = () => {
    // Trigger the email sending process when form is completed
    setShowQuestionsForm(false);
    startTransition(async () => {
      const data = await sendIntroConfirmationMail(
        appointmentId,
        date,
        therapistId,
        browserTimeZone
      );
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
      }
    });
  };

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
      {/* Emphasize Email Section */}
      {showQuestionsForm ? (
        <>
          {/* <div className="bg-gray-100 p-4 rounded-md mb-6">
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
              <strong>{t("duration")}</strong>:{" "}
              {appointmentType.durationInMinutes} {t("minutes")}
            </p>
          </div> */}
          <IntroQuestionsForm onComplete={handleFormCompletion} />
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
              <strong>{t("duration")}</strong>:{" "}
              {appointmentType.durationInMinutes} {t("minutes")}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center mb-6">
            <MdEmail className="text-blue-500 text-6xl animate-bounce mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t("almostThere")}
            </h1>
            <p className="text-lg font-semibold text-blue-600 mb-4">
              {t("emailConfirmationInstructions")}
            </p>
          </div>
          <div className="bg-blue-100 p-6 rounded-md mb-6 text-left">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t("whatToDoNext")}
            </h2>
            <ol className="list-disc list-inside text-gray-700 text-lg">
              <li>{t("checkEmailStep")}</li>
              <li>
                {t("clickConfirmStepStart")}{" "}
                <strong className="font-bold">
                  {t("confirmBookingButton")}
                </strong>{" "}
                {t("clickConfirmStepEnd")}
              </li>
              <li>{t("completeBookingStep")}</li>
            </ol>
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
              <strong>{t("duration")}</strong>:{" "}
              {appointmentType.durationInMinutes} {t("minutes")}
            </p>
          </div>
        </>
      )}

      {/* Appointment Details */}

      {/* Countdown */}
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

      {/* Make Cancel Button Less Prominent */}
      <div className="flex justify-center mt-6">
        <Button
          disabled={isPending}
          size="sm"
          variant="secondary"
          onClick={handleCancelTempReservation}
        >
          {t("cancelReservation")}
        </Button>
      </div>
    </div>
  );
};

export default IntroConfirmationWrapper;
