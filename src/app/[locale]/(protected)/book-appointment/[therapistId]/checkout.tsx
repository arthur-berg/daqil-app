"use client";
import {
  useElements,
  useStripe,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { FormEvent, useEffect, useState } from "react";
import { convertToSubcurrency } from "@/utils";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import { useTranslations } from "next-intl";
import { set } from "date-fns";

const Checkout = ({
  amount,
  reservedAppointment,
}: {
  amount: number;
  reservedAppointment: any;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  /* 
  const t = useTranslations("Checkout"); */

  useEffect(() => {
    fetch(`/api/payment/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: convertToSubcurrency(amount),
        appointmentId: reservedAppointment.appointmentId,
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    /*  const bookingResult = await handleBookAppointment();

    if (!bookingResult.success) {
      setErrorMessage("Failed to book appointment. Please try again.");
      setLoading(false);
      return;
    } */

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
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?amount=${amount}`,
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

    /*    await handleBookAppointment(); */

    setLoading(false);
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div>
        <BeatLoader color="white" />
        <div className="text-lg font-medium text-white">Loading...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {clientSecret && <PaymentElement />}

      {errorMessage && <div>{errorMessage}</div>}

      <div className="w-32 mx-auto">
        <Button disabled={!stripe || loading} className="mt-4 w-full">
          {!loading ? `Pay $${amount}` : "Processing..."}
        </Button>
      </div>
    </form>
  );
};

export default Checkout;
