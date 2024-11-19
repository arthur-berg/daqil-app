"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isAfter,
  parseISO,
  differenceInMinutes,
  isSameDay,
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

import { FaCheck, FaTimes, FaClock, FaQuestion } from "react-icons/fa";
import { useTranslations } from "next-intl";
import BeatLoader from "react-spinners/BeatLoader";
import CancelAppontmentForm from "./cancel-appointment-form";

import { useUserName } from "@/hooks/use-user-name";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import Countdown from "react-countdown";

const AppointmentList = ({ appointments }: { appointments: any }) => {
  const [filterType, setFilterType] = useState("upcoming");

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { getFullName } = useUserName();
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasSetCountdown, setHasSetCountdown] = useState(false);

  const t = useTranslations("AppointmentList");

  useEffect(() => {
    setIsMounted(true); // Set to true when the component mounts
  }, []);

  const nextAppointment = useMemo(() => {
    const futureAppointments = appointments
      .filter(
        (appointment: any) =>
          new Date(appointment.endDate) > new Date() &&
          (appointment.status === "confirmed" ||
            appointment.status === "pending")
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

    return futureAppointments[0] || null;
  }, [appointments]);

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

  const groupedByStatusAndDate = useMemo(() => {
    return filteredAppointments.reduce((acc: any, appointment: any) => {
      const statusGroup = appointment.status;
      const appointmentDate = format(
        new Date(appointment.startDate),
        "yyyy-MM-dd"
      );

      if (!acc[statusGroup]) {
        acc[statusGroup] = {};
      }

      if (!acc[statusGroup][appointmentDate]) {
        acc[statusGroup][appointmentDate] = [];
      }

      acc[statusGroup][appointmentDate].push(appointment);

      // Sort appointments by startDate within each date group
      acc[statusGroup][appointmentDate].sort(
        (a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      return acc;
    }, {});
  }, [filteredAppointments]);

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
        return t("noShowClient");
      case "no-show-both":
        return t("noShowBoth");
      case "not-paid-in-time":
        return t("notPaidInTime");
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

  const sortedStatuses = groupedByStatusAndDate
    ? Object.keys(groupedByStatusAndDate).sort((a, b) => {
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

  const renderNextAppointment = () => {
    const timeUntilStart = differenceInMinutes(
      new Date(nextAppointment.startDate),
      new Date()
    );

    const hasMeetingEnded = new Date() > new Date(nextAppointment.endDate);

    const timeSinceStart = differenceInMinutes(
      new Date(),
      new Date(nextAppointment.startDate)
    );

    const tenMinutesPassedAfterStart =
      timeSinceStart >= 0 && timeSinceStart <= 10;

    const isJoinEnabled =
      ((timeUntilStart <= 20 && timeUntilStart >= 0) ||
        tenMinutesPassedAfterStart ||
        nextAppointment.hostShowUp) &&
      !hasMeetingEnded;

    const isPending = nextAppointment.payment.status === "pending";

    const isSameDayAppointment = isSameDay(
      new Date(nextAppointment.startDate),
      new Date()
    );

    const countdownRenderer = ({ hours, minutes, seconds, completed }: any) => {
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes < 20 && !hasSetCountdown) {
        setIsCountdownFinished(true);
        setHasSetCountdown(true);
      }

      if (completed) {
        return null; // When the countdown is over, we show nothing
      } else {
        return (
          <span>
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
        );
      }
    };

    return (
      <div
        className={
          isPending
            ? "mb-6 p-4 w-full bg-yellow-100 border-l-4 border-yellow-500"
            : "mb-6 p-4 w-full bg-green-100 border-l-4 border-green-500"
        }
      >
        <h2
          className={
            isPending
              ? "text-lg sm:text-2xl font-bold text-yellow-800 mb-2"
              : "text-lg sm:text-2xl font-bold text-green-800 mb-2"
          }
        >
          {t("yourNextAppointment")}
        </h2>
        <div className="text-sm text-gray-700">
          <div>
            <strong>{t("title")}:</strong> {nextAppointment.title}
          </div>
          <div>
            <strong>{t("start")}:</strong>{" "}
            {format(new Date(nextAppointment.startDate), "EEEE, MMMM d, HH:mm")}
          </div>
          <p>
            <strong>{t("participants")}:</strong>{" "}
            {nextAppointment.participants
              .map((participant: any) =>
                getFullName(participant.firstName, participant.lastName)
              )
              .join(", ")}
          </p>

          {isPending && (
            <div className="mt-4 text-yellow-700">
              <div>
                <div> {t("meetingNotPaidMessage")}</div>{" "}
                {t("meetingPaymentDeadline", {
                  timeLimit: 1, // 1 hour before meeting
                })}
              </div>
            </div>
          )}

          {/* Countdown Timer */}
          {isSameDayAppointment && !hasMeetingEnded && timeUntilStart > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {t("timeLeftUntilStart")}:{" "}
              {isMounted && (
                <Countdown
                  date={new Date(nextAppointment.startDate)}
                  renderer={countdownRenderer}
                />
              )}
            </div>
          )}
          <Link
            className="text-center"
            href={`/appointments/${nextAppointment._id}`}
          >
            <Button disabled={!isJoinEnabled}>{t("startMeeting")}</Button>
          </Link>
          <div className="mt-4">
            {isJoinEnabled || isCountdownFinished ? (
              <Link
                className="text-center"
                href={`/appointments/${nextAppointment._id}`}
              >
                <Button disabled={!isJoinEnabled}>{t("startMeeting")}</Button>
              </Link>
            ) : (
              <div className="text-center">
                <Button disabled={!isJoinEnabled}>{t("startMeeting")}</Button>
              </div>
            )}
            {!isJoinEnabled && (
              <>
                {tenMinutesPassedAfterStart ? (
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    {t("tooLateToJoin")}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 mt-2 text-center">
                    {t("joinDisabledMessage", { time: 20 })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <Card className="w-full xl:w-9/12">
      <CardContent>
        <div className="flex justify-center py-8">
          <div className="space-y-8 w-full max-w-4xl">
            <div className="sm:w-2/3 w-full mx-auto">
              {nextAppointment && renderNextAppointment()}
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">
                {t("appointmentFilter")}
              </h3>
              <div className="mt-4">
                <Button
                  onClick={() => setFilterType("upcoming")}
                  variant={filterType === "upcoming" ? undefined : "outline"}
                  className="mr-4 rtl:mr-0 rtl:ml-4"
                >
                  {t("upcoming")}
                </Button>
                <Button
                  onClick={() => setFilterType("history")}
                  variant={filterType === "history" ? undefined : "outline"}
                >
                  {t("history")}
                </Button>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <p className="text-gray-600 text-md">
                {t("timezoneNotice", {
                  timeZone: `${browserTimeZoneFormatted}`,
                })}
              </p>
            </div>

            {sortedStatuses.length ? (
              sortedStatuses.map((status) => (
                <div key={status}>
                  <h2 className="text-xl font-bold mb-4 p-2 bg-secondary rounded-lg shadow-sm border border-gray-200">
                    {status === "confirmed"
                      ? t("confirmedAppointments")
                      : `${statusTranslations[status]} ${t("appointments")}`}
                  </h2>
                  {Object.keys(groupedByStatusAndDate[status])
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
                          {groupedByStatusAndDate[status][date].map(
                            (appointment: any) => {
                              const timeUntilStart = differenceInMinutes(
                                new Date(appointment.startDate),
                                new Date()
                              );

                              const hasMeetingEnded =
                                new Date() > new Date(appointment.endDate);

                              const timeSinceStart = differenceInMinutes(
                                new Date(),
                                new Date(appointment.startDate)
                              );

                              const tenMinutesPassedAfterStart =
                                timeSinceStart >= 0 && timeSinceStart <= 10;

                              const isJoinEnabled =
                                ((timeUntilStart <= 20 &&
                                  timeUntilStart >= 0) ||
                                  tenMinutesPassedAfterStart ||
                                  appointment.hostShowUp) &&
                                !hasMeetingEnded;

                              const disableAccordion =
                                isPast(new Date(appointment.endDate)) &&
                                hasMeetingEnded;
                              return (
                                <AccordionItem
                                  className={`bg-white border rounded-md mb-2 ${
                                    disableAccordion ? "opacity-50" : ""
                                  } ${
                                    appointment.status === "canceled"
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                  key={appointment._id.toString()}
                                  value={appointment._id.toString()}
                                >
                                  <AccordionTrigger className="flex justify-between  p-4 rounded flex-col md:flex-row">
                                    <span>
                                      {format(
                                        new Date(appointment.startDate),
                                        "P HH:mm"
                                      )}{" "}
                                      - {appointment.title}
                                    </span>
                                    <span className="flex items-center gap-2">
                                      {getStatusIcon(appointment.status)}
                                      <div className="mt-2 mb-2 md:mt-0 md:mb-0">
                                        {appointment.participants
                                          .map(
                                            ({
                                              firstName,
                                              lastName,
                                            }: {
                                              firstName: {
                                                en: string;
                                                ar?: string;
                                              };
                                              lastName: {
                                                en: string;
                                                ar?: string;
                                              };
                                            }) =>
                                              `${getFullName(
                                                firstName,
                                                lastName
                                              )} `
                                          )
                                          .join(", ")}
                                      </div>
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent className="p-4 border-t border-gray-200">
                                    <div>
                                      <p className="text-gray-600 mb-4">
                                        {appointment.description}
                                      </p>
                                      <div className="flex justify-between items-start flex-col reverse w-full">
                                        <div className="text-sm text-gray-500 space-y-1 order-last sm:order-1">
                                          <p>
                                            <strong>{t("start")}: </strong>
                                            {format(
                                              new Date(appointment.startDate),
                                              "P HH:mm"
                                            )}
                                          </p>
                                          <p>
                                            <strong>{t("duration")}:</strong>{" "}
                                            {appointment.durationInMinutes}{" "}
                                            {t("minutes")}
                                          </p>
                                          <p>
                                            <strong>{t("status")}:</strong>{" "}
                                            {
                                              statusTranslations[
                                                appointment.status
                                              ]
                                            }
                                          </p>
                                          {appointment.status ===
                                            "canceled" && (
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
                                            {appointment.payment.status ===
                                            "paid"
                                              ? t("yes")
                                              : t("no")}
                                          </p>
                                        </div>
                                        {filterType === "upcoming" &&
                                          (appointment.status === "pending" ||
                                            appointment.status ===
                                              "confirmed") && (
                                            <div className="mb-8 inline-flex justify-center sm:justify-end w-full">
                                              <Button
                                                disabled={
                                                  isPending || disableAccordion
                                                }
                                                variant="secondary"
                                                onClick={() => {
                                                  setSelectedAppointment(
                                                    appointment
                                                  );
                                                  setIsCancelDialogOpen(true);
                                                }}
                                              >
                                                {t("cancelAppointment")}
                                              </Button>
                                            </div>
                                          )}
                                      </div>
                                      <div className="mt-4">
                                        <h4 className="text-md font-semibold">
                                          {t("participants")}:
                                        </h4>
                                        <ul className="text-sm text-gray-500 list-disc list-inside">
                                          {appointment.participants.map(
                                            (participant: any) => (
                                              <li key={participant.userId}>
                                                {getFullName(
                                                  participant.firstName,
                                                  participant.lastName
                                                )}{" "}
                                                ({participant.email})
                                              </li>
                                            )
                                          )}
                                        </ul>
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
                                                    {t("startMeeting")}
                                                  </Button>
                                                </Link>
                                              ) : (
                                                <div className="text-center">
                                                  <Button
                                                    disabled={!isJoinEnabled}
                                                  >
                                                    {t("startMeeting")}
                                                  </Button>
                                                </div>
                                              )}

                                              {!isJoinEnabled && (
                                                <>
                                                  {tenMinutesPassedAfterStart ? (
                                                    <p className="text-sm text-gray-500 mt-2 text-center">
                                                      {t("tooLateToJoin")}
                                                    </p>
                                                  ) : (
                                                    <p className="text-sm text-gray-500 mt-2 text-center">
                                                      {t(
                                                        "joinDisabledMessage",
                                                        {
                                                          time: 20,
                                                        }
                                                      )}
                                                    </p>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          )}
                                      </div>
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
        <CancelAppontmentForm
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
