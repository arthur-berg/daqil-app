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
import datefns from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useMemo } from "react";
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
          className="mr-4 p-2 rtl:mr-0 rtl:ml-4  rounded"
        >
          {t("back")}
        </Button>
        <Button
          onClick={goToCurrent}
          variant="secondary"
          className="mr-4 rtl:mr-0 rtl:ml-4 p-2  rounded"
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

  const formatAMPM = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? t("pm") : t("am"); // Translate AM/PM
    const adjustedHours = hours % 12 || 12; // Convert hours to 12-hour format
    return `${adjustedHours}:${minutes < 10 ? "0" : ""}${minutes} ${period}`;
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleEventClick = (event: any) => {
    setSelectedAppointment(event);
  };

  // Transform appointments to the structure expected by react-big-calendar
  const events = useMemo(
    () =>
      appointments.map((appointment: any) => ({
        ...appointment,
        start: new Date(appointment.startDate),
        end: new Date(appointment.endDate),
        title: appointment.title,
      })),
    [appointments]
  );

  console.log("selectedAppointment", selectedAppointment);

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
      <Calendar
        localizer={localizer}
        events={events}
        toolbar={false}
        formats={{
          timeGutterFormat: (date, culture, localizer) => formatAMPM(date), // Use translated AM/PM
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${formatAMPM(start)} - ${formatAMPM(end)}`, // Time range format for events with translated AM/PM
          agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${formatAMPM(start)} - ${formatAMPM(end)}`, // Time range format for agenda view with translated AM/PM
        }}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        date={currentDate}
        view={currentView}
        defaultView={Views.WEEK}
        views={{ month: true, week: true, day: true }}
        scrollToTime={new Date(currentDate.setHours(8, 0, 0, 0))} // Scroll to 8 AM
        onSelectEvent={handleEventClick}
        eventPropGetter={(event) => ({
          className: "bg-blue-500 text-white p-1 rounded",
        })}
        dayPropGetter={() => ({
          className: "border-b border-gray-200",
        })}
      />
      {selectedAppointment && (
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
                    (participant, index) => (
                      <span key={index}>
                        {participant.firstName} {participant.lastName}
                        {index < selectedAppointment.participants.length - 1
                          ? ", "
                          : ""}
                      </span>
                    )
                  )}
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="rtl:space-x-reverse">
              <Link href={`/appointments/${selectedAppointment._id}`}>
                <Button>{t("startMeeting")}</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
              >
                {t("close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

/*  components={{
          event: () => null,
        }}
        formats={{
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
              end,
              "HH:mm",
              culture
            )}`,
        }} */

export default AppointmentCalendar;
