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

const localizer = momentLocalizer(moment);

const CustomToolbar = ({
  onNavigate,
  label,
  onView,
  view,
}: {
  onNavigate: (action: NavigateAction) => void;
  label: string;
  onView: (view: View) => void;
  view: View;
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
        <button
          onClick={goToBack}
          className="mr-4 p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back
        </button>
        <button
          onClick={goToCurrent}
          className="mr-4 p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Today
        </button>
        <button
          onClick={goToNext}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>
      <div className="text-lg font-bold">{label}</div>
      <div className="flex items-center">
        <button
          onClick={() => onView(Views.WEEK)}
          className={`mr-4 p-2 rounded ${
            view === Views.WEEK
              ? "bg-gray-300"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Week
        </button>
        <button
          onClick={() => onView(Views.MONTH)}
          className={`p-2 rounded ${
            view === Views.MONTH
              ? "bg-gray-300"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Month
        </button>
      </div>
    </div>
  );
};

const AppointmentCalendar = ({ appointments }: { appointments: any }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

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

  return (
    <div className="p-4 space-y-6 bg-white md:w-9/12">
      <h2 className="text-xl md:text-2xl font-bold text-primary mb-4">
        Appointment Calendar
      </h2>
      <CustomToolbar
        onNavigate={handleNavigate}
        label={moment(currentDate).format("MMMM YYYY")}
        onView={handleViewChange}
        view={currentView}
      />
      <Calendar
        localizer={localizer}
        events={events}
        toolbar={false}
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
                  <strong>Start:</strong>{" "}
                  {moment(selectedAppointment.start).format(
                    "MMMM Do YYYY, h:mm a"
                  )}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {moment(selectedAppointment.end).format(
                    "MMMM Do YYYY, h:mm a"
                  )}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {selectedAppointment.description ||
                    "No description provided."}
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Link href={`/appointments/${selectedAppointment._id}`}>
                <Button>Start Meeting</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppointmentCalendar;
