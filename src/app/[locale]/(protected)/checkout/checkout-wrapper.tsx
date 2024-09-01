"use client";
import { useEffect, useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { currencyToSymbol } from "@/utils";
import Checkout from "@/components/checkout";
import Countdown from "react-countdown";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/navigation";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { BeatLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { checkDiscountCodeValidity } from "@/actions/discount-code";
import { createPaymentIntent } from "@/actions/stripe";
import { cancelTempReservation } from "@/actions/appointments/cancel-temp-reservation";
import { confirmBookingPayLater } from "@/actions/appointments/confirm-booking-pay-later";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getClientById } from "@/data/user";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";

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
  const { toast, responseToast } = useToast();
  const router = useRouter();
  const user = useCurrentUser();

  const [discountCode, setDiscountCode] = useState("");
  const [discountCodeApplied, setDiscountCodeApplied] = useState(false);
  const [reservationExpired, setReservationExpired] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);

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

  useEffect(() => {
    if (countdownCompleted) {
      setReservationExpired(true);
    }
  }, [countdownCompleted]);

  useEffect(() => {
    if (reservationExpired) {
      const handleReservationExpiry = async () => {
        startTransition(async () => {
          const data = await cancelTempReservation(appointmentId);
          if (data.success) {
            router.push("/book-appointment");
          } else if (data.error) {
            toast({ title: data.error, variant: "destructive" });
          }
        });
      };

      handleReservationExpiry();
    }
  }, [reservationExpired]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const renderer = useCallback(({ minutes, seconds, completed }: any) => {
    if (completed) {
      setCountdownCompleted(true);
      return null;
    } else {
      return (
        <span>
          {minutes} {t("minutesLeft")}
        </span>
      );
    }
  }, []);

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

  const handleCancelTempReservation = () => {
    startTransition(async () => {
      const data = await cancelTempReservation(appointmentId);
      if (data.success) {
        router.push("/book-appointment");
      }
      if (data.error) {
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
          className="inline-flex justify-center space-x-2 mt-4"
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

  /*  const hasCompletedAppointments = appointments.some((appointment) =>
    appointment?.bookedAppointments?.some(
      (bookedAppointment: any) =>
        bookedAppointment.status === "completed" &&
        bookedAppointment.appointmentTypeId.toString() !==
          APPOINTMENT_TYPE_ID_INTRO_SESSION
    )
  ); */

  return (
    <>
      <div className="flex justify-center">
        <Button
          disabled={isPending}
          className="mb-4"
          size="lg"
          variant="destructive"
          onClick={() => handleCancelTempReservation()}
        >
          {t("cancelReservation")}
        </Button>
      </div>
      <div className={`text-center`}>
        <div className="text-center mb-6">
          <p className="text-lg font-semibold">{t("weHaveReserved")}</p>
          {/* Use one minute in the future as expire date */}
          {isPending ? (
            ""
          ) : (
            <Countdown date={paymentExpiryDate} renderer={renderer} />
          )}
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
            {renderDiscountCodeForm()}
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
                {renderDiscountCodeForm()}
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
