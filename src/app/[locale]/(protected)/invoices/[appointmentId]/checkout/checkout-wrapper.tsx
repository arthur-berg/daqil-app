"use client";

import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { currencyToSymbol } from "@/utils";
import Checkout from "@/components/checkout";
import { useEffect, useState, useTransition } from "react";
import { BeatLoader } from "react-spinners";
import { createPaymentIntent } from "@/actions/stripe";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { checkDiscountCodeValidity } from "@/actions/discount-code";
import Image from "next/image";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";

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
  date: Date;
  appointmentType: any;
  appointmentId: any;
  paymentExpiryDate: Date;
}) => {
  const t = useTranslations("Checkout");
  const [clientSecret, setClientSecret] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [customerSessionClientSecret, setCustomerSessionClientSecret] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountCodeApplied, setDiscountCodeApplied] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [finalAmount, setFinalAmount] = useState(appointmentType.price);
  const locale = useLocale();

  useEffect(() => {
    setLoading(true);

    startTransition(async () => {
      const data = await createPaymentIntent(
        appointmentType._id,
        appointmentId
      );

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

  const renderDiscountCodeForm = () => {
    return (
      <div className="mb-8">
        <Label htmlFor="discountCode" className="block">
          {t("discountCodeLabel")}
        </Label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyDiscount();
          }}
          className="inline-flex justify-center space-x-2 rtl:space-x-reverse mt-4"
        >
          <Input
            id="discountCode"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder={t("enterDiscountCode")}
            disabled={loading || isPending}
          />
          <Button type="submit" disabled={loading || isPending}>
            {t("apply")}
          </Button>
        </form>
      </div>
    );
  };

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <>
      <div className={`text-center`}>
        <div className={`p-4 rounded-md mb-6`}>
          <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
          <p className="mt-2">
            {t("day")}: {format(date, "eeee, MMMM d, yyyy")}{" "}
          </p>
          <p>
            {t("time")}: {format(date, "HH:mm")}{" "}
            <em>({browserTimeZoneFormatted})</em>
          </p>
          <p>
            {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
          </p>
          <p>
            {discountLoading ? (
              t("calculatingPrice")
            ) : (
              <>
                {locale === "ar"
                  ? `${
                      Number(finalAmount) % 1 === 0
                        ? Number(finalAmount)
                        : Number(finalAmount).toFixed(2)
                    }${currencyToSymbol("USD")}`
                  : `${currencyToSymbol("USD")}${
                      Number(finalAmount) % 1 === 0
                        ? Number(finalAmount)
                        : Number(finalAmount).toFixed(2)
                    }`}
              </>
            )}
          </p>
          <div className="mt-3 text-sm text-gray-600">
            <p>{t("cancellationPolicy")}</p>
          </div>
        </div>
        {loading || discountLoading ? (
          <div>
            <BeatLoader />
            <div className="text-lg font-medium ">
              {discountLoading ? t("discountLoading") : t("loadingCheckout")}
            </div>
          </div>
        ) : (
          <>
            {renderDiscountCodeForm()}
            {/* <div className="bg-gray-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6">
              <p className="text-sm">
                <div>
                  <strong>{t("yourPrivacyAndSecurity")}</strong>{" "}
                </div>
                {t("privacyMessage")}
              </p>
            </div> */}
            <div className="flex justify-center mb-4">
              <Image
                src="https://zakina-images.s3.eu-north-1.amazonaws.com/stripe-badge-grey.png"
                width={500}
                height={500}
                alt="Pay securely with Stripe"
                className="object-contain max-w-[400px] w-full transition-all duration-300 ease-in-out"
              />
            </div>
            <Elements
              stripe={stripePromise}
              options={{
                customerSessionClientSecret,
                clientSecret,
                locale: locale as any,
              }}
            >
              <Checkout
                clientSecret={clientSecret}
                amount={finalAmount}
                appointmentId={appointmentId}
              />
            </Elements>
          </>
        )}
      </div>
    </>
  );
};

export default CheckoutWrapper;
