"use client";

import { startTransition, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { confirmIntroBooking } from "@/actions/confirm-intro-booking";
import { MdCheckCircle } from "react-icons/md"; // Success icon
import { FormSuccess } from "@/components/form-success"; // Import FormSuccess

const ConfirmBooking = ({ appointmentId }: { appointmentId: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("ConfirmBookingPage");

  useEffect(() => {
    if (!appointmentId) {
      setError(t("missingAppointmentId"));
      return;
    }

    const confirmBooking = async () => {
      try {
        startTransition(async () => {
          const data = await confirmIntroBooking(appointmentId);
          if (data.success) {
            setSuccess(data.success);
            router.push(
              `/intro-booking-success?appointmentId=${appointmentId}`
            );
            setLoading(false);
          } else {
            setError(data.error || t("somethingWentWrong"));
            setLoading(false);
          }
        });
      } catch (err) {
        setError(t("somethingWentWrong"));
      }
    };

    confirmBooking();
  }, [appointmentId, router, t]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        {/* <MdCheckCircle className="text-green-500 text-5xl mb-4" />{" "} */}
        {/* Success Icon */}
        <BeatLoader color="#0d1a36" />
        <p className="mt-4 text-gray-600">{t("confirmingBookingText")}</p>{" "}
        {/* Text */}
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center">
        <MdCheckCircle className="text-green-500 text-5xl mb-4" />{" "}
        <FormSuccess message={success} />
        <BeatLoader color="#0d1a36" className="mt-4" />
        <div className="mt-4">{t("redirecting")}</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  return null;
};

export default ConfirmBooking;
