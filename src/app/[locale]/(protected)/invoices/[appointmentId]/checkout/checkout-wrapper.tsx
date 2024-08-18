"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency } from "@/utils";
import Checkout from "@/components/checkout";
import Countdown, { CountdownRendererFn } from "react-countdown";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutWrapper = ({
  date,
  appointmentType,
  appointmentId,
}: {
  date: Date; // Specify that date is of type Date
  appointmentType: any;
  appointmentId: any;
}) => {
  const t = useTranslations("Checkout");

  return (
    <>
      <div className={`text-center`}>
        <div className={`p-4 rounded-md mb-6`}>
          <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
          <p className="mt-2">
            {t("day")}: {format(date, "eeee, MMMM d, yyyy")}{" "}
          </p>
          <p>
            {t("time")}: {format(date, "kk:mm")}
          </p>
          <p>
            {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
          </p>
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
            appointmentId={appointmentId}
          />
        </Elements>
      </div>
    </>
  );
};

export default CheckoutWrapper;
