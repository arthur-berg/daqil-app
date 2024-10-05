"use client";
import {
  Calendar,
  Views,
  NavigateAction,
  View,
  dateFnsLocalizer,
} from "react-big-calendar";
import { useState, useMemo, useTransition } from "react";
import { enGB } from "date-fns/locale"; // Import English and Arabic locales

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  sub,
  add,
  differenceInMinutes,
  isPast,
} from "date-fns";
import CancelAppontmentForm from "./cancel-appointment-form";
import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { useUserName } from "@/hooks/use-user-name";
import { useMediaQuery } from "react-responsive";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-GB": enGB,
};

const resourceMap = [
  {
    resourceId: 1,
    resourceTitle: "Appointments",
  },
];

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomToolbar = ({
  onNavigate,
  label,
  onView,
  view,
  t,
}: {
  onNavigate: (action: NavigateAction) => void;
  label: string;
  onView: (view: View) => void;
  view: View;
  t: any;
}) => {
  const goToBack = () => {
    onNavigate("PREV" as NavigateAction);
  };

  const goToNext = () => {
    onNavigate("NEXT" as NavigateAction);
  };

  const goToCurrent = () => {
    onNavigate("TODAY" as NavigateAction);
  };
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
      <div className="flex items-center mb-4 sm:mb-0">
        <Button
          onClick={goToBack}
          variant="secondary"
          className="mr-2 sm:mr-4 p-2 rtl:mr-0 rtl:ml-4 rounded"
        >
          {t("back")}
        </Button>
        <Button
          onClick={goToCurrent}
          variant="secondary"
          className="mr-2 sm:mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded"
        >
          {t("today")}
        </Button>
        <Button variant="secondary" onClick={goToNext} className="p-2 rounded">
          {t("next")}
        </Button>
      </div>
      <div className="text-lg font-bold mb-4 sm:mb-0">{label}</div>
      <div className="flex items-center">
        {isMobile ? (
          <>
            <Button
              variant={view === Views.DAY ? undefined : "secondary"}
              onClick={() => onView(Views.DAY)}
              className="mr-2 sm:mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded"
            >
              {t("day")}
            </Button>
            <Button
              variant={view === Views.WEEK ? undefined : "secondary"}
              onClick={() => onView(Views.WEEK)}
              className="mr-2 sm:mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded"
            >
              {t("week")}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant={view === Views.WEEK ? undefined : "secondary"}
              onClick={() => onView(Views.WEEK)}
              className="mr-2 sm:mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded"
            >
              {t("week")}
            </Button>
            <Button
              variant={view === Views.MONTH ? undefined : "secondary"}
              onClick={() => onView(Views.MONTH)}
              className="p-2 rounded"
            >
              {t("month")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const AppointmentCalendar = ({ appointments }: { appointments: any }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [currentView, setCurrentView] = useState<View>(
    isMobile ? Views.DAY : Views.WEEK
  );
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { getFullName } = useUserName();
  const [filterType, setFilterType] = useState("upcoming");

  const t = useTranslations("AppointmentCalendar");

  const handleNavigate = (action: NavigateAction) => {
    const newDate = new Date(currentDate);

    switch (action) {
      case "PREV":
        setCurrentDate(
          sub(newDate, {
            [currentView === Views.MONTH ? "months" : "weeks"]: 1,
          })
        );
        break;
      case "NEXT":
        setCurrentDate(
          add(newDate, {
            [currentView === Views.MONTH ? "months" : "weeks"]: 1,
          })
        );
        break;
      case "TODAY":
        setCurrentDate(new Date());
        break;
      default:
        break;
    }
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: locales["en-GB"] });
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleEventClick = (event: any) => {
    setSelectedAppointment(event);
  };

  const getStatusTranslation = (status: string) => {
    switch (status) {
      case "confirmed":
        return t("confirmed");
      case "canceled":
        return t("canceled");
      case "completed":
        return t("completed");
      case "pending":
        return t("pending");
      default:
        return t("unknown");
    }
  };

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

  const events = useMemo(
    () =>
      filteredAppointments?.map((appointment: any) => {
        return {
          ...appointment,
          start: new Date(appointment.startDate),
          end: new Date(appointment.endDate),
          title: appointment.title,
          resourceId: 1,
        };
      }),
    [filteredAppointments]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#1B2233";
      case "canceled":
        return "#F14A4A";
      case "completed":
        return "#0A0E1A";
      case "pending":
        return "#738091";
      default:
        return "#D8E1E8";
    }
  };

  return (
    <div className="p-4 space-y-6 bg-white w-full xl:w-9/12">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 text-center sm:text-left">
        {t("appointmentsCalendar")}
      </h2>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">{t("appointmentFilter")}</h3>
        <div className="mt-4">
          <Button
            onClick={() => setFilterType("upcoming")}
            variant={filterType === "upcoming" ? undefined : "outline"}
            className="mr-4"
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
      <CustomToolbar
        onNavigate={handleNavigate}
        label={format(currentDate, "MMMM yyyy", { locale: locales["en-GB"] })}
        onView={handleViewChange}
        view={currentView}
        t={t}
      />

      {isMobile ? (
        <>
          <Calendar
            localizer={localizer}
            events={events}
            toolbar={false}
            resourceIdAccessor="resourceId"
            resources={resourceMap}
            resourceTitleAccessor="resourceTitle"
            formats={{
              timeGutterFormat: (date) => formatTime(date),
              eventTimeRangeFormat: ({ start, end }) =>
                `${formatTime(start)} - ${formatTime(end)}`,
              agendaTimeRangeFormat: ({ start, end }) =>
                `${formatTime(start)} - ${formatTime(end)}`,
            }}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100vh" }}
            date={currentDate}
            view={currentView}
            defaultView={Views.DAY}
            views={{ day: true, week: true }}
            step={60}
            scrollToTime={new Date(currentDate.setHours(8, 0, 0, 0))}
            onSelectEvent={handleEventClick}
            eventPropGetter={(event) => ({
              style: { backgroundColor: getStatusColor(event.status) },
            })}
            dayPropGetter={() => ({
              className: "border-b border-gray-200",
            })}
          />
        </>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          toolbar={false}
          formats={{
            timeGutterFormat: (date) => formatTime(date),
            eventTimeRangeFormat: ({ start, end }) =>
              `${formatTime(start)} - ${formatTime(end)}`,
            agendaTimeRangeFormat: ({ start, end }) =>
              `${formatTime(start)} - ${formatTime(end)}`,
          }}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100vh" }}
          date={currentDate}
          view={currentView}
          defaultView={Views.WEEK}
          views={{ month: true, week: true, day: true }}
          scrollToTime={new Date(currentDate.setHours(8, 0, 0, 0))}
          onSelectEvent={handleEventClick}
          eventPropGetter={(event) => ({
            style: { backgroundColor: getStatusColor(event.status) },
          })}
          dayPropGetter={() => ({
            className: "border-b border-gray-200",
          })}
        />
      )}

      {showCancelForm && (
        <CancelAppontmentForm
          selectedAppointment={selectedAppointment}
          isPending={isPending}
          startTransition={startTransition}
          isCancelDialogOpen={showCancelForm}
          setIsCancelDialogOpen={(value: boolean, action: string) => {
            setShowCancelForm(false);
            if (action !== "goBack") {
              setSelectedAppointment(null);
            }
          }}
        />
      )}
      {selectedAppointment && !showCancelForm && (
        <Dialog
          open={!!selectedAppointment}
          onOpenChange={() => setSelectedAppointment(null)}
        >
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent className="w-11/12 sm:max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{selectedAppointment.title}</DialogTitle>
              <DialogDescription>
                <p>
                  <strong>{t("start")}:</strong>{" "}
                  {format(
                    new Date(selectedAppointment.start),
                    "MMMM do yyyy, HH:mm",
                    { locale: locales["en-GB"] }
                  )}
                </p>
                <p>
                  <strong>{t("end")}:</strong>{" "}
                  {format(
                    new Date(selectedAppointment.end),
                    "MMMM do yyyy, HH:mm",
                    { locale: locales["en-GB"] }
                  )}
                </p>
                <p>
                  <strong>{t("description")}:</strong>{" "}
                  {selectedAppointment.description || t("noDescription")}
                </p>
                <p>
                  <strong>{t("client")}:</strong>{" "}
                  {selectedAppointment.participants.map(
                    (participant: any, index: number) => (
                      <span key={index}>
                        {getFullName(
                          participant.firstName,
                          participant.lastName
                        )}
                        {index < selectedAppointment.participants.length - 1
                          ? ", "
                          : ""}
                      </span>
                    )
                  )}
                </p>
                <p>
                  <strong>{t("status")}:</strong>{" "}
                  {getStatusTranslation(selectedAppointment.status)}
                </p>
                <div>
                  {(selectedAppointment.status === "pending" ||
                    selectedAppointment.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-4 mb-4"
                      onClick={() => {
                        setShowCancelForm(true);
                      }}
                    >
                      {t("cancelAppointment")}
                    </Button>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="rtl:space-x-reverse">
              {selectedAppointment.status === "confirmed" && (
                <div>
                  {(() => {
                    const timeUntilStart = differenceInMinutes(
                      new Date(selectedAppointment.startDate),
                      new Date()
                    );

                    const hasMeetingEnded =
                      new Date() > new Date(selectedAppointment.endDate);

                    const timeSinceStart = differenceInMinutes(
                      new Date(),
                      new Date(selectedAppointment.startDate)
                    );

                    const tenMinutesPassedAfterStart =
                      timeSinceStart >= 0 && timeSinceStart <= 10;

                    const isJoinEnabled =
                      ((timeUntilStart <= 20 && timeUntilStart >= 0) ||
                        tenMinutesPassedAfterStart ||
                        selectedAppointment.hostShowUp) &&
                      !hasMeetingEnded;

                    return isJoinEnabled ? (
                      <div className="flex justify-center">
                        <Link
                          className="text-center"
                          href={`/appointments/${selectedAppointment._id}`}
                        >
                          <Button disabled={!isJoinEnabled}>
                            {t("startMeeting")}
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-center">
                          <div className="flex-1 text-center">
                            <Button
                              disabled={!isJoinEnabled}
                              className="mx-auto"
                            >
                              {t("startMeeting")}
                            </Button>
                          </div>
                        </div>
                        {tenMinutesPassedAfterStart ? (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {t("tooLateToJoin")}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            {t("joinDisabledMessage", {
                              time: 20,
                            })}
                            <br />
                            {t("refreshMessage")}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppointmentCalendar;
