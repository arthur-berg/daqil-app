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
  subHours,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { FaCheck, FaTimes, FaClock, FaQuestion } from "react-icons/fa";
import { useTranslations } from "next-intl";

import CancelAppointmentForm from "./cancel-appointment-form";
import { BeatLoader } from "react-spinners";

import { useUserName } from "@/hooks/use-user-name";
import PageTitle from "@/components/page-title";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import Countdown from "react-countdown";

const AppointmentList = ({ appointmentsJson }: { appointmentsJson: any }) => {
  const [filterType, setFilterType] = useState("upcoming");

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const { getFullName } = useUserName();
  const [isCountdownFinished, setIsCountdownFinished] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hasSetCountdown, setHasSetCountdown] = useState(false);

  const t = useTranslations("AppointmentList");

  const appointments = JSON.parse(appointmentsJson);

  useEffect(() => {
    setIsMounted(true); // Set to true when the component mounts
  }, []);

  const pendingPaymentAppointments = useMemo(() => {
    return appointments?.filter(
      (appointment: any) =>
        (appointment.payment?.status === "pending" ||
          appointment.payment?.status === "payAfterBooking") &&
        appointment.status === "confirmed" &&
        !isPast(new Date(appointment.payment.paymentExpiryDate))
    );
  }, [appointments]);

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

  const sortedStatuses = useMemo(() => {
    const statuses = Object.keys(groupedByStatusAndDate);
    return statuses.sort((a: any, b: any) => {
      const order = {
        confirmed: 1,
        pending: 2,
        completed: 3,
        canceled: 4,
      } as any;
      return order[a] - order[b];
    });
  }, [groupedByStatusAndDate]);

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
        nextAppointment.participants[0].showUp) &&
      !hasMeetingEnded;

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
        return null;
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
      <>
        <div
          className={`mb-6 p-4 w-full border-l-4 ${
            nextAppointment.payment.status === "pending"
              ? "bg-yellow-100 border-yellow-500"
              : "bg-green-100 border-green-500"
          }`}
        >
          <h2
            className={`text-lg sm:text-2xl font-bold mb-2 ${
              nextAppointment.payment.status === "pending"
                ? "text-yellow-800"
                : "text-green-800"
            }`}
          >
            {t("yourNextAppointment")}
          </h2>
          <div className="text-sm text-gray-700">
            <p>
              <strong>{t("title")}:</strong> {nextAppointment.title}
            </p>
            <p>
              <strong>{t("start")}:</strong>{" "}
              {format(
                new Date(nextAppointment.startDate),
                "EEEE, MMMM d, HH:mm"
              )}
            </p>
            <p>
              <strong>{t("therapist")}:</strong>{" "}
              {getFullName(
                nextAppointment.hostUserId.firstName,
                nextAppointment.hostUserId.lastName
              )}
            </p>
            {nextAppointment.payment.status === "pending" && (
              <p className="text-red-600 mt-2">{t("meetingNotPaid")}</p>
            )}
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
            <div className="mt-4">
              {isJoinEnabled || isCountdownFinished ? (
                <Link
                  className="text-center"
                  href={`/appointments/${nextAppointment._id}`}
                >
                  <Button disabled={!isJoinEnabled}>{t("joinMeeting")}</Button>
                </Link>
              ) : (
                <div className="text-center">
                  <Button disabled={!isJoinEnabled}>{t("joinMeeting")}</Button>
                </div>
              )}
              {!isJoinEnabled && (
                <>
                  {tenMinutesPassedAfterStart ? (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {t("tooLateToJoin")}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {t("joinDisabledMessage", {
                        time: 20,
                      })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPendingPayments = () => {
    if (pendingPaymentAppointments.length === 0) return null;

    return (
      <div className="mb-6 p-4 w-full bg-red-100 border-l-4 border-red-500">
        <h2 className="text-lg sm:text-2xl font-bold text-red-800 mb-4">
          {t("actionRequired")}
        </h2>
        {pendingPaymentAppointments.map((appointment: any) => {
          const paymentDeadline = subHours(new Date(appointment.startDate), 1);
          const startDateFormatted = format(
            new Date(appointment.startDate),
            "P"
          );
          const startTimeFormatted = format(
            new Date(appointment.startDate),
            "HH:mm"
          );

          return (
            <div
              key={appointment._id}
              className="mb-6 p-4 bg-white rounded shadow-md"
            >
              <p className="text-gray-700 mb-2">
                {t("appointmentReminder", {
                  day: format(new Date(appointment.startDate), "EEEE"),
                  date: startDateFormatted, // Include full date
                  startTime: startTimeFormatted,
                  paymentDeadline: format(paymentDeadline, "P HH:mm"),
                })}
              </p>
              <p className="text-gray-700 mb-2 font-semibold">
                {t("paymentWarning")}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>{t("therapist")}:</strong>{" "}
                {getFullName(
                  appointment.hostUserId.firstName,
                  appointment.hostUserId.lastName
                )}
              </p>
              <p className="text-gray-700 mb-2">
                <strong>{t("title")}:</strong> {appointment.title}
              </p>
              <Link href={`/invoices/${appointment._id}/checkout`}>
                <Button>{t("completePayment")}</Button>
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  return (
    <>
      <div className="w-full xl:w-9/12 mx-auto">
        <PageTitle title={t("appointments")} />
      </div>

      <div className="flex justify-center">
        <div className="w-full xl:w-9/12 p-4 sm:p-6 rounded-xl bg-white">
          <div>
            <div className="flex justify-center py-8">
              <div className="space-y-8 w-full max-w-4xl">
                <div className="w-full sm:w-2/3 mx-auto">
                  {renderPendingPayments()}
                </div>
                <div className="w-full sm:w-2/3 mx-auto">
                  {nextAppointment && renderNextAppointment()}
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold">
                    {t("appointmentFilter")}
                  </h3>
                  <div className="mt-4">
                    <Button
                      onClick={() => setFilterType("upcoming")}
                      variant={
                        filterType === "upcoming" ? undefined : "outline"
                      }
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
                      <h2 className="text-lg sm:text-xl font-bold mb-4 p-2 bg-secondary rounded-lg shadow-sm border border-gray-200">
                        {status === "confirmed"
                          ? t("confirmedAppointments")
                          : `${statusTranslations[status]} ${t(
                              "appointments"
                            )}`}
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
                                      appointment.participants[0].showUp) &&
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
                                            {getFullName(
                                              appointment.hostUserId.firstName,
                                              appointment.hostUserId.lastName
                                            )}
                                          </div>
                                        </span>
                                      </AccordionTrigger>
                                      <AccordionContent className="p-4 border-t border-gray-200">
                                        <div className="flex justify-between items-start flex-col reverse w-full">
                                          <div className="text-sm text-gray-500 space-y-1 order-last sm:order-1">
                                            <p>
                                              <strong>{t("start")}: </strong>{" "}
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
                                              {appointment.status}
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
                                            {t("therapist")}:
                                          </h4>
                                          <p className="text-sm text-gray-500">
                                            {getFullName(
                                              appointment.hostUserId.firstName,
                                              appointment.hostUserId.lastName
                                            )}{" "}
                                            ({appointment.hostUserId.email})
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
                                                  <>
                                                    {tenMinutesPassedAfterStart ? (
                                                      <p className="text-xs text-gray-500 mt-2 text-center">
                                                        {t("tooLateToJoin")}
                                                      </p>
                                                    ) : (
                                                      <p className="text-xs text-gray-500 mt-2 text-center">
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
          </div>

          {selectedAppointment && (
            <CancelAppointmentForm
              selectedAppointment={selectedAppointment}
              isPending={isPending}
              startTransition={startTransition}
              isCancelDialogOpen={isCancelDialogOpen}
              setIsCancelDialogOpen={setIsCancelDialogOpen}
              setSelectedAppointment={setSelectedAppointment}
            />
          )}

          {/* Loader Overlay */}
          {isPending && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
              <BeatLoader color="#ffffff" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentList;
