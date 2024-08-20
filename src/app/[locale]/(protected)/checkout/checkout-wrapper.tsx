"use client";

import { startTransition, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency, currencyToSymbol } from "@/utils";
import Checkout from "@/components/checkout";
import Countdown, { CountdownRendererFn } from "react-countdown";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/navigation";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { confirmBookingPayLater } from "@/actions/appointments/actions";
import { useToast } from "@/components/ui/use-toast";
import { BeatLoader } from "react-spinners";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutWrapper = ({
  date,
  appointmentType,
  appointmentId,
  therapistId,
  paymentExpiryDate,
}: {
  date: Date;
  appointmentType: any;
  appointmentId: any;
  therapistId: string;
  paymentExpiryDate: Date;
}) => {
  const [hasSavedPaymentMethod, setHasSavedPaymentMethod] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Checkout");
  const [paymentOption, setPaymentOption] = useState<"payBefore" | "payAfter">(
    "payBefore"
  );
  const [clientSecret, setClientSecret] = useState("");
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [chargeCardLoading, setChargeCardLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/payment/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: convertToSubcurrency(appointmentType.price),
        appointmentId: appointmentId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!!data.savedPaymentMethods) {
          setHasSavedPaymentMethod(true);
        } else {
          setClientSecret(data.clientSecret);
          setCustomerSessionClientSecret(data.customerSessionClientSecret);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [appointmentType.price]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayLater = () => {
    const appointmentDate = format(date, "yyyy-MM-dd");
    startTransition(async () => {
      const data = await confirmBookingPayLater(
        appointmentId,
        appointmentDate,
        therapistId,
        appointmentType._id
      );
      if (data.success) {
        router.push(`/booking-confirmed?appointmentId=${appointmentId}`);
      }
      if (data.error) {
        toast({ title: data?.error, variant: "destructive" });
      }
    });
  };

  const renderer = ({ minutes, seconds, completed }: any) => {
    if (completed) {
      return <span>{t("paymentExpired")}</span>;
    } else {
      return (
        <span>
          {minutes} {t("minutesLeft")}
        </span>
      );
    }
  };

  const chargeCard = async () => {
    setChargeCardLoading(true);
    const response = await fetch("/api/payment/charge-customer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appointmentId: appointmentId,
        amount: convertToSubcurrency(appointmentType.price),
      }),
    });

    const data = await response.json();
    if (data.success) {
      router.push(`/booking-confirmed?appointmentId=${appointmentId}`);
    } else if (data.error) {
      setChargeCardLoading(false);
      toast({ title: data?.error, variant: "destructive" });
    }
  };

  return (
    <>
      <Link href="/book-appointment">
        <Button variant="outline">{t("goBack")}</Button>
      </Link>

      {loading ? (
        <div className="text-center mt-8 pb-8">
          <BeatLoader />
          <div className="text-lg font-medium ">{t("loadingCheckout")}</div>
        </div>
      ) : (
        <div className={`text-center`}>
          <div className="text-center mb-6">
            <p className="text-lg font-semibold">{t("weHaveReserved")}</p>
            <Countdown date={paymentExpiryDate} renderer={renderer} />
          </div>
          <div className={`p-4 rounded-md mb-6`}>
            <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
            <p className="mt-2">
              {t("day")}: {format(date, "eeee, MMMM d, yyyy")}{" "}
            </p>
            <p>
              {t("time")}: {format(date, "kk:mm")}
            </p>
            <p>
              {t("duration")}: {appointmentType.durationInMinutes}{" "}
              {t("minutes")}
            </p>
            <p>
              {t("price")}: {currencyToSymbol(appointmentType.currency)}
              {appointmentType.price}
            </p>
          </div>
          {hasSavedPaymentMethod ? (
            <>
              {chargeCardLoading ? (
                <div>
                  <BeatLoader />
                  <div className="text-lg font-medium ">
                    {t("confirmingPleaseWait")}
                  </div>
                </div>
              ) : (
                <Button onClick={chargeCard} disabled={isPending}>
                  {t("confirmAndPay")}
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {t("whenDoYouWantToPay")}
                </h3>
                <div className="flex justify-center space-x-4">
                  <RadioGroup
                    disabled={isPending}
                    defaultValue="payBefore"
                    onValueChange={(value: "payAfter" | "payBefore") => {
                      setPaymentOption(value);
                    }}
                  >
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="payBefore" id="payBefore" />
                        <Label htmlFor="payBefore">{t("payBefore")}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="payAfter" id="payAfter" />
                        <Label htmlFor="payAfter">{t("payAfter")}</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              {paymentOption === "payBefore" ? (
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
                    setCustomerSessionClientSecret={
                      setCustomerSessionClientSecret
                    }
                    amount={appointmentType.price}
                    appointmentId={appointmentId}
                  />
                </Elements>
              ) : (
                <Button onClick={handlePayLater} disabled={isPending}>
                  {t("confirmAndPayLater")}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CheckoutWrapper;
