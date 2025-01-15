"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { cancelAppointment } from "@/actions/appointments/cancel-appointment";
import { useUserName } from "@/hooks/use-user-name";

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
  const { responseToast } = useToast();
  const { getFullName } = useUserName();
  const form = useForm<z.infer<typeof CancelAppointmentSchema>>({
    resolver: zodResolver(CancelAppointmentSchema),
    defaultValues: {
      appointmentId: selectedAppointment._id,
      reason: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CancelAppointmentSchema>) => {
    startTransition(async () => {
      try {
        const data = await cancelAppointment(values);

        responseToast(data);

        form.reset();

        setIsCancelDialogOpen(false);
      } catch {
        console.error("Error canceling appointment");
      }
    });
  };
  return (
    <Dialog
      open={isCancelDialogOpen}
      onOpenChange={() => setIsCancelDialogOpen(false)}
    >
      <DialogContent className="w-11/12 sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{t("areYouSure")}</DialogTitle>
              <DialogDescription>
                <div>
                  <strong>{t("title")}: </strong> {selectedAppointment?.title}
                </div>
                <div>
                  <strong>{t("participants")}: </strong>{" "}
                  {selectedAppointment.participants.map((participant: any) => (
                    <div key={participant.userId}>
                      {getFullName(participant.firstName, participant.lastName)}{" "}
                      ({participant.email})
                    </div>
                  ))}
                </div>
                <div>
                  <strong>{t("start")}: </strong>
                  {format(new Date(selectedAppointment.startDate), "P HH:mm")}
                </div>
                <div>
                  <strong>{t("duration")}: </strong>
                  {selectedAppointment?.durationInMinutes} {t("minutes")}
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t("enterReason")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} autoFocus={false} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="rtl:space-x-reverse">
              <div className="flex flex-col sm:flex-row">
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isPending}
                  className="mb-4 sm:mb-0"
                >
                  {t("cancelAppointment")}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCancelDialogOpen(false)}
                >
                  {t("goBack")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppontmentForm;
