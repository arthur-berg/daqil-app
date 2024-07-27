"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CancelAppointmentSchema } from "@/schemas";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cancelAppointment } from "@/actions/appointments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const CancelAppontmentForm = ({
  selectedAppointment,
  isPending,
  startTransition,
  setIsCancelDialogOpen,
  isCancelDialogOpen,
}: {
  selectedAppointment: any;
  isPending: any;
  startTransition: any;
  isCancelDialogOpen: any;
  setIsCancelDialogOpen: any;
}) => {
  const t = useTranslations("AppointmentList");
  const { toast } = useToast();
  const form = useForm<z.infer<typeof CancelAppointmentSchema>>({
    resolver: zodResolver(CancelAppointmentSchema),
    defaultValues: {
      appointmentId: selectedAppointment._id,
      reason: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CancelAppointmentSchema>) => {
    setIsCancelDialogOpen(false);
    startTransition(async () => {
      try {
        const data = await cancelAppointment(values);

        if (data?.error) {
          toast({
            title: data.error,
            variant: "destructive",
          });
        }

        if (data?.success) {
          toast({
            title: data.success,
            variant: "success",
          });
          form.reset();
        }
      } catch {
        console.error("Error canceling appointment");
      }
    });
  };

  const onError = (error: any) => {
    console.log("error", error);
  };

  console.log("form", JSON.stringify(form.getValues()));

  return (
    <Dialog
      open={isCancelDialogOpen}
      onOpenChange={() => setIsCancelDialogOpen(false)}
    >
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t("areYouSure")}</DialogTitle>
              <DialogDescription>
                <p>
                  <strong>{t("title")}: </strong> {selectedAppointment?.title}
                </p>
                <p>
                  <strong>{t("therapist")}: </strong>
                  {selectedAppointment.hostUserId.firstName}{" "}
                  {selectedAppointment.hostUserId.lastName}
                </p>
                <p>
                  <strong>{t("start")}: </strong>
                  {format(new Date(selectedAppointment.startDate), "Pp")}
                </p>
                <p>
                  <strong>{t("duration")}: </strong>
                  {selectedAppointment?.durationInMinutes} {t("minutes")}
                </p>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t("enterReason")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="rtl:space-x-reverse">
              <Button variant="destructive" type="submit" disabled={isPending}>
                {t("cancelAppointment")}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCancelDialogOpen(false)}
              >
                {t("goBack")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppontmentForm;
