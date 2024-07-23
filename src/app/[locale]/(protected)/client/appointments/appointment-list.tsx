"use client";
import { useState } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isAfter,
  parseISO,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaCheck, FaTimes, FaClock, FaQuestion } from "react-icons/fa";

const AppointmentList = ({ appointments }: { appointments: any }) => {
  const [filter, setFilter] = useState("all");

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments?.filter(
          (appointment: any) => appointment.status === filter
        );

  const groupedByStatus = filteredAppointments?.reduce(
    (acc: any, appointment: any) => {
      if (!acc[appointment.status]) acc[appointment.status] = {};
      const date = format(new Date(appointment.startDate), "yyyy-MM-dd");
      if (!acc[appointment.status][date]) acc[appointment.status][date] = [];
      acc[appointment.status][date].push(appointment);
      return acc;
    },
    {}
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <FaCheck className="text-green-500" />;
      case "canceled":
        return <FaTimes className="text-red-500" />;
      case "completed":
        return <FaCheck className="text-blue-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaQuestion className="text-gray-500" />;
    }
  };

  const getDateLabel = (date: string) => {
    const parsedDate = new Date(date);
    if (isToday(parsedDate)) return "Today";
    if (isTomorrow(parsedDate)) return "Tomorrow";
    return format(parsedDate, "eeee, MMMM d");
  };

  const sortedStatuses = groupedByStatus
    ? Object.keys(groupedByStatus).sort((a, b) => {
        if (a === "confirmed") return -1;
        if (b === "confirmed") return 1;
        return a.localeCompare(b);
      })
    : [];

  return (
    <Card className="md:w-8/12">
      <CardContent>
        <div className="flex justify-center py-8">
          <div className="space-y-8 w-full max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="flex justify-center items-center mb-6 flex-col md:flex-row">
                <div className="mr-4">Appointment Status: </div>
                <Select
                  defaultValue="all"
                  onValueChange={(value) => setFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {sortedStatuses.length ? (
              sortedStatuses.map((status) => (
                <div key={status}>
                  <h2 className="text-xl font-bold mb-4">
                    {status === "confirmed"
                      ? "Confirmed Appointments"
                      : status.charAt(0).toUpperCase() +
                        status.slice(1) +
                        " Appointments"}
                  </h2>
                  {Object.keys(groupedByStatus[status])
                    .sort((a, b) => {
                      const dateA = parseISO(a);
                      const dateB = parseISO(b);

                      if (isToday(dateA)) return -1;
                      if (isToday(dateB)) return 1;
                      if (isTomorrow(dateA)) return -1;
                      if (isTomorrow(dateB)) return 1;
                      if (isPast(dateA) && !isPast(dateB)) return 1;
                      if (!isPast(dateA) && isPast(dateB)) return -1;
                      return isAfter(dateA, dateB) ? 1 : -1;
                    })
                    .map((date) => (
                      <div key={date}>
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                          {getDateLabel(date)}
                        </h3>
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full mb-4"
                        >
                          {groupedByStatus[status][date].map(
                            (appointment: any) => (
                              <AccordionItem
                                className={`bg-white ${
                                  isPast(new Date(appointment.startDate))
                                    ? "opacity-50"
                                    : ""
                                }`}
                                key={appointment._id.toString()}
                                value={appointment._id.toString()}
                              >
                                <AccordionTrigger className="flex justify-between p-4 bg-gray-100 rounded">
                                  <span>
                                    {format(
                                      new Date(appointment.startDate),
                                      "Pp"
                                    )}{" "}
                                    - {appointment.title}
                                  </span>
                                  <span className="flex items-center gap-2">
                                    {getStatusIcon(appointment.status)}
                                    {appointment.hostUserId.firstName}{" "}
                                    {appointment.hostUserId.lastName}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 border-t border-gray-200">
                                  <div>
                                    <p className="text-gray-600 mb-4">
                                      {appointment.description}
                                    </p>
                                    <div className="text-sm text-gray-500 space-y-1">
                                      <p>
                                        <strong>Start:</strong>{" "}
                                        {format(
                                          new Date(appointment.startDate),
                                          "Pp"
                                        )}
                                      </p>
                                      <p>
                                        <strong>Duration:</strong>{" "}
                                        {appointment.durationInMinutes} minutes
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        {appointment.status}
                                      </p>
                                      <p>
                                        <strong>Paid:</strong>{" "}
                                        {appointment.paid ? "Yes" : "No"}
                                      </p>
                                    </div>
                                    <div className="mt-4">
                                      <h4 className="text-md font-semibold">
                                        Host:
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        {appointment.hostUserId.firstName}{" "}
                                        {appointment.hostUserId.lastName} (
                                        {appointment.hostUserId.email})
                                      </p>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                      <Link
                                        href={`/appointments/${appointment._id}`}
                                      >
                                        <Button>Join Meeting</Button>
                                      </Link>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <p>No appointments available.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
