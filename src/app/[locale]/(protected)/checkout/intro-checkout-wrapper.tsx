"use client";
import { useEffect, useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Countdown from "react-countdown";
import { useRouter } from "@/navigation";
import { useToast } from "@/components/ui/use-toast";
import { createSetupIntent } from "@/actions/stripe";
import { cancelTempReservation } from "@/actions/appointments/cancel-temp-reservation";
import { useCurrentUser } from "@/hooks/use-current-user";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import IntroCheckout from "@/app/[locale]/(protected)/checkout/intro-checkout";
import { format } from "date-fns";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const IntroCheckoutWrapper = ({
  appointmentId,
  paymentExpiryDate,
  appointmentType,
  date,
}: {
  date: Date;
  appointmentType: any;
  appointmentId: any;
  paymentExpiryDate: Date;
}) => {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [reservationExpired, setReservationExpired] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);

  const t = useTranslations("IntroCheckoutTranslation");
  const router = useRouter();
  const { toast } = useToast();
  const user = useCurrentUser();

  useEffect(() => {
    setLoading(true);
    startTransition(async () => {
      const data = await createSetupIntent(appointmentId);

      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      } else {
        setClientSecret(data.clientSecret);
      }

      setLoading(false);
    });
  }, [appointmentId, toast]);

  const handleCancelTempReservation = () => {
    startTransition(async () => {
      const data = await cancelTempReservation(appointmentId);
      if (data.success) {
        router.push("/book-appointment");
      } else if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      }
    });
  };

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

  const renderer = useCallback(({ minutes, seconds, completed }: any) => {
    if (completed) {
      setCountdownCompleted(true);
      return null;
    } else {
      return (
        <span>
          {minutes} {t("minutesLeft")}
        </span>
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return "No user found";

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <>
      <div className="flex justify-center">
        <Button
          disabled={isPending}
          className="mb-4"
          size="lg"
          variant="destructive"
          onClick={() => handleCancelTempReservation()}
        >
          {t("cancelReservation")}
        </Button>
      </div>
      <div className="text-center mb-6">
        <p className="text-lg font-semibold">{t("weHaveReserved")}</p>
        {isPending ? (
          ""
        ) : (
          <Countdown date={paymentExpiryDate} renderer={renderer} />
        )}
      </div>
      <div className={`p-4 rounded-md mb-6 flex flex-col items-center`}>
        <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
        <p className="mt-2">
          {t("day")}: {format(date, "eeee, MMMM d, yyyy")}{" "}
        </p>
        <p className="mt-2">
          {t("time")}: {format(date, "HH:mm")}{" "}
          <em>({browserTimeZoneFormatted})</em>
        </p>
        <p className="mt-2">
          {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
        </p>
      </div>
      <div className="text-center">
        <div className="text-center mb-8">
          <p className="text-lg font-semibold">{t("cancellationTerms")}</p>
          <p className="text-destructive">{t("cancellationNotice")}</p>
          <p>{t("cancellationReason")}</p>
        </div>

        {loading ? (
          <div className="text-center mt-8 pb-8">
            <BeatLoader />
            <div className="text-lg font-medium">{t("loadingCheckout")}</div>
          </div>
        ) : (
          <div className="flex justify-center mb-4 flex-col">
            <div className="flex justify-center">
              <Image
                src="https://zakina-images.s3.eu-north-1.amazonaws.com/stripe-payment.png"
                width={150}
                height={150}
                alt="Pay securely with Stripe"
              />
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
              }}
            >
              <IntroCheckout
                clientSecret={clientSecret}
                appointmentId={appointmentId}
              />
            </Elements>
          </div>
        )}
      </div>
    </>
  );
};

export default IntroCheckoutWrapper;
