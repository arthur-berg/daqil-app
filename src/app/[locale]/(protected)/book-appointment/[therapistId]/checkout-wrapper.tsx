"use client";

import { bookAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { currencyToSymbol } from "@/utils";
import { format, set } from "date-fns";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency } from "@/utils";
import Checkout from "./checkout";

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
}: {
  date?: any;
  setSuccess: (success: string) => void;
  appointmentType: any;
  therapistId: string;
  setDate: any;
}) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("BookingCalendar");
  const { responseToast } = useToast();

  const handleBookAppointment = async () => {
    const combinedDateTime = set(date.justDate as Date, {
      hours: date?.dateTime?.getHours(),
      minutes: date?.dateTime?.getMinutes(),
    });
    startTransition(async () => {
      console.log("bookAppointment");
      const data = await bookAppointment(
        appointmentType,
        therapistId,
        combinedDateTime
      );
      responseToast(data);
    });
  };

  return (
    <>
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() =>
          setDate((prev: any) => {
            return {
              ...prev,
              justDate: undefined,
            };
          })
        }
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
          <p>
            {t("cost")}: {currencyToSymbol(appointmentType.currency)}
            {appointmentType.price}
          </p>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Zakina</h1>
          <h2 className="text-2xl">
            has requested
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
          }}
        >
          <Checkout
            amount={appointmentType.price}
            handleBookAppointment={handleBookAppointment}
          />
        </Elements>
      </div>
    </>
  );
};

export default CheckoutWrapper;
