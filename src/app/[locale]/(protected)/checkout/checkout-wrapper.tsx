"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency, currencyToSymbol } from "@/utils";
import Checkout from "@/components/checkout";
import Countdown from "react-countdown";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/navigation";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { confirmBookingPayLater } from "@/actions/appointments/actions";
import { useToast } from "@/components/ui/use-toast";
import { BeatLoader } from "react-spinners";
import { Input } from "@/components/ui/input"; // Import the Input component
import { set } from "lodash";
import { checkDiscountCodeValidity } from "@/actions/discount-code";
import { createPaymentIntent } from "@/actions/stripe";

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
  /*   const [isApplyDiscountPending, startApplyDiscountTransition] = useTransition(); */
  const [finalAmount, setFinalAmount] = useState(appointmentType.price);
  const t = useTranslations("Checkout");
  const [paymentOption, setPaymentOption] = useState<"payBefore" | "payAfter">(
    "payBefore"
  );
  const [clientSecret, setClientSecret] = useState("");
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [discountLoading, setDiscountLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [discountCode, setDiscountCode] = useState("");
  const [discountCodeApplied, setDiscountCodeApplied] = useState(false);

  useEffect(() => {
    setLoading(true);

    startTransition(async () => {
      const data = await createPaymentIntent(
        appointmentType._id,
        appointmentId
      );
      if (!!data.savedPaymentMethods) {
        setHasSavedPaymentMethod(true);
      }
      setClientSecret(data.clientSecret);
      setCustomerSessionClientSecret(data.customerSessionClientSecret);
      if (data.error) {
        toast({ title: data.error, variant: "destructive" });
      }
      setLoading(false);
    });
  }, [appointmentType.price]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!discountCodeApplied) return;
    setDiscountLoading(true);
    startTransition(async () => {
      const data = await createPaymentIntent(
        appointmentType._id,
        appointmentId,
        discountCode
      );
      if (!!data.savedPaymentMethods) {
        setHasSavedPaymentMethod(true);
      }
      if (data.discountCodeError || data.error) {
        toast({ title: data.error, variant: "destructive" });
      }
      if (data.discountCodeSuccess) {
        toast({ title: data.discountCodeSuccess, variant: "success" });
        setFinalAmount(data.finalAmount);
      }
      setClientSecret(data.clientSecret);
      setCustomerSessionClientSecret(data.customerSessionClientSecret);

      setDiscountLoading(false);
    });
  }, [discountCodeApplied]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleApplyDiscount = () => {
    startTransition(async () => {
      const data = await checkDiscountCodeValidity(discountCode);
      if (data.success) {
        setDiscountCodeApplied(true);
      }
      if (data.error) {
        setDiscountCodeApplied(false);
        toast({ title: data.error, variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Link href="/book-appointment">
        <Button variant="outline">{t("goBack")}</Button>
      </Link>
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
            {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
          </p>

          <p>
            {discountLoading ? (
              t("calculatingPrice")
            ) : (
              <>
                {t("price")}: {currencyToSymbol(appointmentType.currency)}
                {finalAmount}
              </>
            )}
          </p>
        </div>

        {loading || discountLoading ? (
          <div className="text-center mt-8 pb-8">
            <BeatLoader />
            <div className="text-lg font-medium ">
              {discountLoading ? t("discountLoading") : t("loadingCheckout")}
            </div>
          </div>
        ) : hasSavedPaymentMethod ? (
          <>
            <div className="mb-8">
              <Label htmlFor="discountCode">{t("discountCodeLabel")}</Label>
              <div className="flex justify-center space-x-2 mt-4">
                <Input
                  id="discountCode"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder={t("enterDiscountCode")}
                  disabled={loading || isPending}
                />
                <Button
                  onClick={handleApplyDiscount}
                  disabled={loading || isPending}
                >
                  {t("apply")}
                </Button>
              </div>
            </div>
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
          </>
        ) : (
          <>
            <div className="mb-8">
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
                      <Label htmlFor="payAfter">{t("payLater")}</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {paymentOption === "payBefore" ? (
              <>
                <div className="mb-6">
                  <Label className="block" htmlFor="discountCode">
                    {t("discountCodeLabel")}
                  </Label>
                  <div className="inline-flex justify-center space-x-2 mt-4">
                    <Input
                      id="discountCode"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder={t("enterDiscountCode")}
                      disabled={loading || isPending}
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      disabled={loading || isPending}
                    >
                      {t("apply")}
                    </Button>
                  </div>
                </div>
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
                    amount={finalAmount}
                    appointmentId={appointmentId}
                  />
                </Elements>
              </>
            ) : (
              <div>
                <p className="mb-4">{t("payLatestOneHourBefore")}</p>
                <p className="mb-4">{t("addDiscountLater")}</p>
                <Button onClick={handlePayLater} disabled={isPending}>
                  {t("confirmAndPayLater")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutWrapper;
