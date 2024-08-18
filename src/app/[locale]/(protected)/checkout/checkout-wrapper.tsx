"use client";

import { startTransition, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { convertToSubcurrency, currencyToSymbol } from "@/utils";
import Checkout from "./checkout";
import Countdown, { CountdownRendererFn } from "react-countdown";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/navigation";
import { RadioGroupItem, RadioGroup } from "@/components/ui/radio-group";
import { confirmBookingPayLater } from "@/actions/appointments/actions";
import { toast, useToast } from "@/components/ui/use-toast";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutWrapper = ({
  date,
  appointmentType,
  appointmentId,
  therapistId,
}: {
  date: Date; // Specify that date is of type Date
  appointmentType: any;
  appointmentId: any;
  therapistId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Checkout");
  const [paymentOption, setPaymentOption] = useState<"payBefore" | "payAfter">(
    "payBefore"
  );
  const { toast } = useToast();
  const router = useRouter();

  const handlePayLater = () => {
    // Logic to confirm the appointment without payment
    // You can add your logic here to handle the "Pay after" option
    const appointmentDate = format(date, "yyyy-MM-dd");
    startTransition(async () => {
      const data = await confirmBookingPayLater(
        appointmentId,
        appointmentDate,
        therapistId
      );
      if (data.success) {
        router.push(`/booking-confirmed?appointmentId=${appointmentId}`);
      }
      if (data.error) {
        toast({ title: data?.error, variant: "destructive" });
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
        </div>
        <div className={`p-4 rounded-md mb-6`}>
          <h2 className="text-2xl font-bold">{t("appointmentDetails")}:</h2>
          <p className="mt-2">
            {t("day")}: {format(date, "eeee, MMMM d, yyyy")}{" "}
            {/* Use date directly */}
          </p>
          <p>
            {t("time")}: {format(date, "kk:mm")} {/* Use date directly */}
          </p>
          <p>
            {t("duration")}: {appointmentType.durationInMinutes} {t("minutes")}
          </p>
        </div>

        {/*   <div className="mb-10">
          <h1 className="text-4xl font-extrabold mb-2">{t("zakina")}</h1>
          <h2 className="text-2xl">
            {t("hasRequested")}
            <span className="font-bold">
              {" "}
              {currencyToSymbol(appointmentType.currency)}
              {appointmentType.price}
            </span>
          </h2>
        </div>
 */}
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
        ) : (
          <Button onClick={handlePayLater} disabled={isPending}>
            {t("confirmAndPayLater")}
          </Button>
        )}
      </div>
    </>
  );
};

export default CheckoutWrapper;
