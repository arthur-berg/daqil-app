"use client";

import { sendTherapistInviteEmail } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from "react";

const SendEmailButton = ({
  therapistId,
  email,
}: {
  email: string;
  therapistId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const handleSendInvite = async () => {
    try {
      startTransition(async () => {
        const data = await sendTherapistInviteEmail(therapistId, email);
        responseToast(data);
      });
    } catch (error) {
      console.error("Error sending invite email:", error);
    }
  };
  return (
    <Button
      onClick={() => handleSendInvite()}
      variant="success"
      disabled={isPending}
      size="sm"
    >
      Send Invitation Email
    </Button>
  );
};

export default SendEmailButton;
