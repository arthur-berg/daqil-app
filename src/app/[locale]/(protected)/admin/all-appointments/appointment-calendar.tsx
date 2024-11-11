"use client";
import { useEffect, useState, useTransition } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { getAllAppointmentsByDate } from "@/actions/admin";
import { BeatLoader } from "react-spinners";

const AppointmentCalendar = () => {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<any>([]);

  useEffect(() => {
    const todaysDate = new Date();
    const formattedDate = format(todaysDate, "yyyy-MM-dd");
    startTransition(async () => {
      try {
        const jsonData = await getAllAppointmentsByDate(formattedDate);
        if (!jsonData) return;
        const data = JSON.parse(jsonData);

        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          console.error("Unexpected data format:", data);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }
    });
  }, []);

  const handleSelectDate = (date?: Date) => {
    if (!date) return;

    const formattedDate = format(date, "yyyy-MM-dd");
    setSelectedDate(date);
    startTransition(async () => {
      try {
        const jsonData = await getAllAppointmentsByDate(formattedDate);
        if (!jsonData) return;
        const data = JSON.parse(jsonData);

        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          console.error("Unexpected data format:", data);
          setAppointments([]);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Appointments Calendar</h1>
      <Calendar
        mode="single"
        selected={selectedDate as any}
        onSelect={(date) => handleSelectDate(date)}
        className="w-full sm:max-w-none max-w-xs sm:w-auto overflow-hidden rounded-md border h-auto"
        classNames={{
          months:
            "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",
          month: "space-y-4 w-full flex flex-col",
          table: "w-full border-collapse space-y-1",
          head_row: "",
          row: "w-full",
        }}
      />
      {isPending ? (
        <div className="flex justify-center mt-10">
          <BeatLoader />
        </div>
      ) : (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Psychologist</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cancellation Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appointment: any) => (
                <TableRow key={appointment._id}>
                  <TableCell>{appointment.title}</TableCell>
                  <TableCell>
                    {format(new Date(appointment.startDate), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(appointment.endDate), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    {appointment.hostUserId
                      ? `${appointment.hostUserId.firstName.en} ${appointment.hostUserId.lastName.en}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {appointment.participants &&
                    appointment.participants.length > 0
                      ? appointment.participants
                          .map(
                            (participant: any) =>
                              `${participant.userId.firstName.en} ${participant.userId.lastName.en}`
                          )
                          .join(", ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{appointment.status}</TableCell>
                  <TableCell>
                    {appointment.status === "canceled"
                      ? appointment.cancellationReason === "custom"
                        ? appointment.customCancellationReason || "N/A"
                        : appointment.cancellationReason || "N/A"
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No appointments available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AppointmentCalendar;
