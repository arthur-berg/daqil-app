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
import { useToast } from "@/components/ui/use-toast";

const IntroCheckout = ({
  clientSecret,
  appointmentId,
}: {
  clientSecret: string;
  appointmentId: string;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("IntroCheckoutTranslation");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    // Call elements.submit() to handle client-side validation
    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      toast({
        title: submitError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Confirm the setup using Stripe's confirmSetup method
    const { error } = await stripe.confirmSetup({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/intro-booking-success?appointmentId=${appointmentId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      toast({
        title: error.message,
        variant: "destructive",
      });
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
          {t("loadingSetup")}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md">
      {errorMessage && (
        <div className="text-destructive mb-4 mt-4">{errorMessage}</div>
      )}
      {clientSecret && <PaymentElement />}

      <div className="w-32 mx-auto">
        <Button disabled={!stripe || loading} className="mt-4 w-full" size="lg">
          {!loading ? t("bookAppointment") : t("processingPayment")}
        </Button>
      </div>
      {loading && (
        <div className="absolute inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <BeatLoader color="#ffffff" className="mb-2" />
            <div className="text-white">{t("processingPayment")}</div>
          </div>
        </div>
      )}
    </form>
  );
};

export default IntroCheckout;
