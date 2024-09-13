"use client";
import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import { useTranslations } from "next-intl";

const Checkout = ({
  amount,
  appointmentId,
  clientSecret,
}: {
  amount: number;
  appointmentId: any;
  clientSecret: any;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Checkout");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?appointmentId=${appointmentId}&amountPaid=${amount}`,
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when confirming the payment
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      // The payment UI automatically closes with a success animation.
      // Your customer is redirected to your 'return_url'
    }

    setLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="mb-4">
        <BeatLoader color="white" />
        <div className="text-lg font-medium text-white">
          {t("loadingCheckout")}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {clientSecret && <PaymentElement />}

      {errorMessage && <div>{errorMessage}</div>}

      <div className="w-32 mx-auto">
        <Button disabled={!stripe || loading} className="mt-4 w-full">
          {!loading ? t("pay", { amount }) : t("processing")}
        </Button>
      </div>
    </form>
  );
};

export default Checkout;
