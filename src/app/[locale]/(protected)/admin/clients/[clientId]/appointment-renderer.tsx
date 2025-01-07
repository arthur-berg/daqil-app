"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { format, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import CancelAppointmentForm from "./cancel-appointment-form";

const AppointmentRenderer = ({
  appointmentsJson,
  clientId,
}: any) => {
  const [filterType, setFilterType] = useState("upcoming");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const appointments = JSON.parse(appointmentsJson);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment: any) => {
      const isPastAppointment = isPast(new Date(appointment.endDate));
      const isUpcoming =
        appointment.status === "confirmed" || appointment.status === "pending";
      const isHistory =
        appointment.status === "completed" || appointment.status === "canceled";

      if (filterType === "upcoming") {
        return !isPastAppointment && isUpcoming;
      } else {
        return isPastAppointment || isHistory;
      }
    });
  }, [appointments, filterType]);

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-center mb-4 space-x-2 rtl:space-x-reverse">
        <Button
          onClick={() => setFilterType("upcoming")}
          variant={filterType === "upcoming" ? undefined : "outline"}
        >
          Upcoming
        </Button>
        <Button
          onClick={() => setFilterType("history")}
          variant={filterType === "history" ? undefined : "outline"}
        >
          History
        </Button>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filteredAppointments.map((appointment: any) => (
          <AccordionItem
            key={appointment._id}
            value={appointment._id.toString()}
            className="bg-white border rounded-md mb-2"
          >
            <AccordionTrigger className="p-4 text-left flex justify-between items-center">
              <span>
                {format(new Date(appointment.startDate), "P HH:mm")} -{" "}
                {appointment.title}
              </span>
              <span className="text-gray-500">{appointment.status}</span>
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <p>
                <strong>Start:</strong>{" "}
                {format(new Date(appointment.startDate), "P HH:mm")}
              </p>
              <p>
                <strong>Duration:</strong> {appointment.durationInMinutes}{" "}
                minutes
              </p>
              <p>
                <strong>Status:</strong> {appointment.status}
              </p>
              {!isPast(new Date(appointment.endDate)) && (
                <Button
                  variant="destructive"
                  onClick={() => handleCancelClick(appointment)}
                  className="mt-4"
                >
                  Cancel Appointment
                </Button>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {selectedAppointment && (
        <CancelAppointmentForm
          isOpen={isCancelDialogOpen}
          onClose={() => setIsCancelDialogOpen(false)}
          appointment={selectedAppointment}
          isPending={isPending}
          startTransition={startTransition}
        />
      )}
    </div>
  );
};

export default AppointmentRenderer;
