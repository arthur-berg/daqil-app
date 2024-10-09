"use client";

import { acceptTherapist, rejectTherapist } from "@/actions/selected-therapist";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

const AcceptTherapist = ({ therapistId }: { therapistId: string }) => {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("BookAppointmentPage");
  const { responseToast } = useToast();

  const handleAccept = () => {
    startTransition(async () => {
      const data = await acceptTherapist(therapistId);
      responseToast(data);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const data = await rejectTherapist(therapistId);
      responseToast(data);
    });
  };

  return (
    <div className="flex justify-center gap-4">
      <Button
        variant="success"
        className="w-32 py-2"
        onClick={handleAccept}
        disabled={isPending}
      >
        {t("accept")}
      </Button>
      <Button
        variant="destructive"
        className="w-32 py-2"
        disabled={isPending}
        onClick={handleReject}
      >
        {t("reject")}
      </Button>
    </div>
  );
};

export default AcceptTherapist;
