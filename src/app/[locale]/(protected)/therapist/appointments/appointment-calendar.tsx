"use client";
import {
  Calendar,
  Views,
  momentLocalizer,
  ToolbarProps,
  NavigateAction,
  View,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo, useTransition } from "react";
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
import { format, isPast, differenceInMinutes } from "date-fns";
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

const localizer = momentLocalizer(moment);

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

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <Button
          onClick={goToBack}
          variant="secondary"
          className="mr-4 p-2 rtl:mr-0 rtl:ml-4 rounded"
        >
          {t("back")}
        </Button>
        <Button
          onClick={goToCurrent}
          variant="secondary"
          className="mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded"
        >
          {t("today")}
        </Button>
        <Button variant="secondary" onClick={goToNext} className="p-2 rounded">
          {t("next")}
        </Button>
      </div>
      <div className="text-lg font-bold">{label}</div>
      <div className="flex items-center">
        <Button
          variant={view === Views.WEEK ? undefined : "secondary"}
          onClick={() => onView(Views.WEEK)}
          className={`mr-4 rtl:mr-0 rtl:ml-4 p-2 rounded`}
        >
          {t("week")}
        </Button>
        <Button
          variant={view === Views.MONTH ? undefined : "secondary"}
          onClick={() => onView(Views.MONTH)}
          className={`p-2 rounded`}
        >
          {t("month")}
        </Button>
      </div>
    </div>
  );
};

const AppointmentCalendar = ({ appointments }: { appointments: any }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { getFullName } = useUserName();
  const [filters, setFilters] = useState<string[]>([
    "confirmed",
    "completed",
    "pending",
  ]);

  const t = useTranslations("AppointmentCalendar");

  const handleNavigate = (action: NavigateAction) => {
    const newDate = moment(currentDate).toDate();
    switch (action) {
      case "PREV":
        setCurrentDate(
          moment(newDate)
            .subtract(1, currentView === Views.MONTH ? "month" : "week")
            .toDate()
        );
        break;
      case "NEXT":
        setCurrentDate(
          moment(newDate)
            .add(1, currentView === Views.MONTH ? "month" : "week")
            .toDate()
        );
        break;
      case "TODAY":
        setCurrentDate(new Date());
        break;
      default:
        break;
    }
  };

  const formatAMPM = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? t("pm") : t("am");
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes < 10 ? "0" : ""}${minutes} ${period}`;
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
    if (filters.length === 0) {
      return appointments;
    }
    return appointments?.filter((appointment: any) =>
      filters.includes(appointment.status)
    );
  }, [appointments, filters]);

  const events = useMemo(
    () =>
      filteredAppointments?.map((appointment: any) => ({
        ...appointment,
        start: new Date(appointment.startDate),
        end: new Date(appointment.endDate),
        title: appointment.title,
      })),
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
    <div className="p-4 space-y-6 bg-white md:w-9/12">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">
        {t("appointmentsCalendar")}
      </h2>
      <CustomToolbar
        onNavigate={handleNavigate}
        label={moment(currentDate).format("MMMM YYYY")}
        onView={handleViewChange}
        view={currentView}
        t={t}
      />
      <div className="flex justify-center mb-6">
        <div className="flex items-center mb-6 flex-col">
          <div className="mr-4">{t("appointmentStatus")}:</div>
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
      <Calendar
        localizer={localizer}
        events={events}
        toolbar={false}
        formats={{
          timeGutterFormat: (date, culture, localizer) => formatAMPM(date),
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${formatAMPM(start)} - ${formatAMPM(end)}`,
          agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${formatAMPM(start)} - ${formatAMPM(end)}`,
        }}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedAppointment.title}</DialogTitle>
              <DialogDescription>
                <p>
                  <strong>{t("start")}:</strong>{" "}
                  {moment(selectedAppointment.start).format(
                    "MMMM Do YYYY, h:mm a"
                  )}
                </p>
                <p>
                  <strong>{t("end")}:</strong>{" "}
                  {moment(selectedAppointment.end).format(
                    "MMMM Do YYYY, h:mm a"
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
                      new Date(selectedAppointment.start),
                      new Date()
                    );
                    const hasMeetingEnded =
                      new Date() > new Date(selectedAppointment.end);
                    const isJoinEnabled =
                      timeUntilStart <= 20 &&
                      timeUntilStart >= 0 &&
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
                        <p className="text-sm text-gray-500 mt-2 text-center">
                          {t("joinDisabledMessage", {
                            time: 20,
                          })}
                          <br />
                          {t("refreshMessage")}
                        </p>
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
