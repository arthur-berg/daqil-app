"use client";

import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency } from "@/utils";
import Checkout from "@/components/checkout";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutWrapper = ({
  date,
  appointmentType,
  appointmentId,
  paymentExpiryDate,
}: {
  date: Date; // Specify that date is of type Date
  appointmentType: any;
  appointmentId: any;
  paymentExpiryDate: Date;
}) => {
  const t = useTranslations("Checkout");
  const [clientSecret, setClientSecret] = useState("");
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState("");

  useEffect(() => {
    fetch(`/api/payment/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentTypeId: appointmentType._id,
        appointmentId: appointmentId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setCustomerSessionClientSecret(data.customerSessionClientSecret);
      });
  }, [appointmentType.price]); // eslint-disable-line react-hooks/exhaustive-deps

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
        {!clientSecret ? (
          <div>
            <BeatLoader />
            <div className="text-lg font-medium ">{t("loadingCheckout")}</div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              customerSessionClientSecret,
              clientSecret,
            }}
          >
            <Checkout
              clientSecret={clientSecret}
              setClientSecret={setClientSecret}
              setCustomerSessionClientSecret={setCustomerSessionClientSecret}
              amount={appointmentType.price}
              appointmentId={appointmentId}
            />
          </Elements>
        )}
      </div>
    </>
  );
};

export default CheckoutWrapper;
