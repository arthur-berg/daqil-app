"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInHours } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CancelAppointmentSchema } from "@/schemas";
import { cancelAppointment } from "@/actions/appointments/cancel-appointment";
import { useToast } from "@/components/ui/use-toast";

const CancelAppointmentForm = ({
  isOpen,
  onClose,
  appointment,
  isPending,
  startTransition,
}: {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  isPending: boolean;
  startTransition: any;
}) => {
  const { responseToast } = useToast();
  const form = useForm<z.infer<typeof CancelAppointmentSchema>>({
    resolver: zodResolver(CancelAppointmentSchema),
    defaultValues: {
      appointmentId: appointment._id,
      reason: "",
    },
  });

  const hoursUntilAppointment = differenceInHours(
    new Date(appointment.startDate),
    new Date()
  );

  const onSubmit = (values: z.infer<typeof CancelAppointmentSchema>) => {
    onClose();
    startTransition(async () => {
      try {
        const data = await cancelAppointment(values);
        responseToast(data);
        form.reset();
      } catch (error) {
        console.error("Error canceling appointment", error);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-11/12 sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              {hoursUntilAppointment < 24 && (
                <p className="text-red-600 font-bold">
                  Warning: This appointment is within 24 hours, and may not be
                  eligible for a refund.
                </p>
              )}
              <div>
                <strong>Title:</strong> {appointment.title}
              </div>
              <div>
                <strong>Start:</strong>{" "}
                {format(new Date(appointment.startDate), "P HH:mm")}
              </div>
              <div>
                <strong>Duration:</strong> {appointment.durationInMinutes}{" "}
                minutes
              </div>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            {...form.register("reason")}
            placeholder="Enter cancellation reason"
          />
          <DialogFooter>
            <Button variant="destructive" type="submit" disabled={isPending}>
              Confirm Cancel
            </Button>
            <Button variant="outline" onClick={onClose}>
              Go Back
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentForm;
