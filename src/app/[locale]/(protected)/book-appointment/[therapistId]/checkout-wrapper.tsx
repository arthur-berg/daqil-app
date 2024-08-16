"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency, currencyToSymbol } from "@/utils";
import Checkout from "./checkout";
import Countdown, { CountdownRendererFn } from "react-countdown";
import { useCurrentUser } from "@/hooks/use-current-user";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutWrapper = ({
  date,
  setSuccess,
  appointmentType,
  therapistId,
  setDate,
  reservedAppointment,
  setReservedAppointment,
}: {
  date?: any;
  setSuccess: (success: string) => void;
  appointmentType: any;
  therapistId: string;
  setDate: any;
  reservedAppointment: any;
  setReservedAppointment: any;
}) => {
  const t = useTranslations("BookingCalendar");

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setReservedAppointment(null);
          setDate((prev: any) => ({
            ...prev,
            justDate: undefined,
          }));
        }}
      >
        {t("goBack")}
      </Button>

      <div
        className={`bg-secondary p-10 text-black text-center m-10 rounded-md`}
      >
        <div className={`p-4 rounded-md mb-6`}>
          <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
          <p className="mt-2">
            {t("day")}: {format(date.dateTime, "eeee, MMMM d, yyyy")}
          </p>
          <p>
            {t("time")}: {format(date.dateTime, "kk:mm")}
          </p>
          <p>
            {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold">{t("weHaveReserved")}</p>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">{t("zakina")}</h1>
          <h2 className="text-2xl">
            {t("hasRequested")}
            <span className="font-bold">
              {" "}
              {currencyToSymbol(appointmentType.currency)}
              {appointmentType.price}
            </span>
          </h2>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            mode: "payment",
            amount: convertToSubcurrency(appointmentType.price),
            currency: "usd",
            setup_future_usage: "off_session",
          }}
        >
          <Checkout
            amount={appointmentType.price}
            reservedAppointment={reservedAppointment}
          />
        </Elements>
      </div>
    </>
  );
};

export default CheckoutWrapper;
