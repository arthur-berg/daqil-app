"use client";
import { useMemo, useState, useTransition } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isAfter,
  parseISO,
  differenceInMinutes,
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
import { useTranslations } from "next-intl";

import CancelAppointmentForm from "./cancel-appointment-form"; // Import your client CancelAppointmentForm
import { BeatLoader } from "react-spinners";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";

const AppointmentList = ({ appointmentsJson }: { appointmentsJson: any }) => {
  const [filters, setFilters] = useState<string[]>([
    "confirmed",
    "completed",
    "pending",
  ]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("AppointmentList");

  const appointments = JSON.parse(appointmentsJson);

  const filteredAppointments = useMemo(() => {
    if (filters.length === 0) {
      return appointments;
    }
    return appointments?.filter((appointment: any) =>
      filters.includes(appointment.status)
    );
  }, [appointments, filters]);

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

  const getCancellationReason = (cancellationReason: string) => {
    switch (cancellationReason) {
      case "no-show-host":
        return t("noShowHost");
      case "no-show-participant":
        return t("noShowParticipant");
      case "no-show-both":
        return t("noShowBoth");
      default:
        return "";
    }
  };

  const getDateLabel = (date: string) => {
    const parsedDate = new Date(date);
    if (isToday(parsedDate)) return t("today");
    if (isTomorrow(parsedDate)) return t("tomorrow");
    return format(parsedDate, "eeee, MMMM d");
  };

  const sortedStatuses = groupedByStatus
    ? Object.keys(groupedByStatus).sort((a, b) => {
        if (a === "confirmed") return -1;
        if (b === "confirmed") return 1;
        return a.localeCompare(b);
      })
    : [];

  const statusTranslations: { [key: string]: string } = {
    confirmed: t("confirmed"),
    canceled: t("canceled"),
    completed: t("completed"),
    pending: t("pending"),
  };

  return (
    <Card className="md:w-8/12">
      <CardContent>
        <div className="flex justify-center py-8">
          <div className="space-y-8 w-full max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="flex justify-center items-center mb-6 flex-col">
                <div className="mr-4 rtl:mr-0 rtl:ml-4">
                  {t("appointmentStatus")}:{" "}
                </div>
                <MultiSelector values={filters} onValuesChange={setFilters}>
                  <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder={t("selectStatus")} />
                  </MultiSelectorTrigger>
                  <MultiSelectorContent>
                    <MultiSelectorList>
                      <MultiSelectorItem value="confirmed">
                        {t("confirmed")}
                      </MultiSelectorItem>
                      <MultiSelectorItem value="canceled">
                        {t("canceled")}
                      </MultiSelectorItem>
                      <MultiSelectorItem value="completed">
                        {t("completed")}
                      </MultiSelectorItem>
                      <MultiSelectorItem value="pending">
                        {t("pending")}
                      </MultiSelectorItem>
                    </MultiSelectorList>
                  </MultiSelectorContent>
                </MultiSelector>
              </div>
            </div>
            {sortedStatuses.length ? (
              sortedStatuses.map((status) => (
                <div key={status}>
                  <h2 className="text-xl font-bold mb-4">
                    {status === "confirmed"
                      ? t("confirmedAppointments")
                      : `${statusTranslations[status]} ${t("appointments")}`}
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
                            (appointment: any) => {
                              const timeUntilStart = differenceInMinutes(
                                new Date(appointment.startDate),
                                new Date()
                              );

                              const hasMeetingEnded =
                                new Date() > new Date(appointment.endDate);

                              const isJoinEnabled =
                                timeUntilStart <= 20 &&
                                timeUntilStart >= 0 &&
                                !hasMeetingEnded;

                              const disableAccordion =
                                isPast(new Date(appointment.startDate)) &&
                                hasMeetingEnded;

                              return (
                                <AccordionItem
                                  className={`bg-white ${
                                    disableAccordion ? "opacity-50" : ""
                                  } ${
                                    appointment.status === "canceled"
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
                                    <div className="flex justify-between items-start">
                                      <div className="text-sm text-gray-500 space-y-1">
                                        <p>
                                          <strong>{t("start")}: </strong>{" "}
                                          {format(
                                            new Date(appointment.startDate),
                                            "Pp"
                                          )}
                                        </p>
                                        <p>
                                          <strong>{t("duration")}:</strong>{" "}
                                          {appointment.durationInMinutes}{" "}
                                          {t("minutes")}
                                        </p>
                                        <p>
                                          <strong>{t("status")}:</strong>{" "}
                                          {appointment.status}
                                        </p>
                                        {appointment.status === "canceled" && (
                                          <>
                                            {appointment.cancellationReason ===
                                            "custom" ? (
                                              <p>
                                                <strong>
                                                  {t("cancellationReason")}:
                                                </strong>{" "}
                                                {
                                                  appointment.customCancellationReason
                                                }
                                              </p>
                                            ) : (
                                              <p>
                                                <strong>
                                                  {t("cancellationReason")}:
                                                </strong>{" "}
                                                {getCancellationReason(
                                                  appointment.cancellationReason
                                                )}
                                              </p>
                                            )}
                                          </>
                                        )}
                                        <p>
                                          <strong>{t("paid")}:</strong>{" "}
                                          {appointment.paid ? "Yes" : "No"}
                                        </p>
                                      </div>
                                      {(appointment.status === "pending" ||
                                        appointment.status === "confirmed") && (
                                        <Button
                                          disabled={isPending}
                                          variant="secondary"
                                          onClick={() => {
                                            setSelectedAppointment(appointment);
                                            setIsCancelDialogOpen(true);
                                          }}
                                        >
                                          {t("cancelAppointment")}
                                        </Button>
                                      )}
                                    </div>
                                    <div className="mt-4">
                                      <h4 className="text-md font-semibold">
                                        {t("host")}:
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        {appointment.hostUserId.firstName}{" "}
                                        {appointment.hostUserId.lastName} (
                                        {appointment.hostUserId.email})
                                      </p>
                                    </div>
                                    <div className="mt-6 flex justify-center">
                                      {appointment.status === "confirmed" &&
                                        !isPending && (
                                          <div className="flex flex-col align-items center">
                                            {isJoinEnabled ? (
                                              <Link
                                                className="text-center"
                                                href={`/appointments/${appointment._id}`}
                                              >
                                                <Button
                                                  disabled={!isJoinEnabled}
                                                >
                                                  {t("joinMeeting")}
                                                </Button>
                                              </Link>
                                            ) : (
                                              <div className="text-center">
                                                <Button
                                                  disabled={!isJoinEnabled}
                                                >
                                                  {t("joinMeeting")}
                                                </Button>
                                              </div>
                                            )}

                                            {!isJoinEnabled && (
                                              <p className="text-sm text-gray-500 mt-2 text-center">
                                                {t("joinDisabledMessage", {
                                                  time: 20,
                                                })}
                                                <br />
                                                {t("refreshMessage")}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              );
                            }
                          )}
                        </Accordion>
                      </div>
                    ))}
                </div>
              ))
            ) : (
              <p>{t("noAppointments")}</p>
            )}
          </div>
        </div>
      </CardContent>

      {selectedAppointment && (
        <CancelAppointmentForm
          selectedAppointment={selectedAppointment}
          isPending={isPending}
          startTransition={startTransition}
          isCancelDialogOpen={isCancelDialogOpen}
          setIsCancelDialogOpen={setIsCancelDialogOpen}
        />
      )}

      {/* Loader Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <BeatLoader color="#ffffff" />
        </div>
      )}
    </Card>
  );
};

export default AppointmentList;
