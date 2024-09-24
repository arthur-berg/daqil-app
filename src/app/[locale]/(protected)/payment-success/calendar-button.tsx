"use client";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { formatInTimeZone } from "date-fns-tz"; // for time zone handling

const CalendarButton = ({
  appointment, // appointment object with date details
  userTimeZone, // user's preferred time zone
}: {
  appointment: any;
  userTimeZone: string;
}) => {
  const startDateFormatted = formatInTimeZone(
    new Date(appointment.startDate),
    userTimeZone,
    "yyyy-MM-dd'T'HH:mm" // ISO format with time
  );
  const endDateFormatted = formatInTimeZone(
    new Date(appointment.endDate),
    userTimeZone,
    "yyyy-MM-dd'T'HH:mm" // ISO format with time
  );

  return (
    <AddToCalendarButton
      name={appointment.title}
      description={appointment.description || "Appointment details"}
      startDate={startDateFormatted} // formatted start date
      endDate={endDateFormatted} // formatted end date
      timeZone={userTimeZone} // user's preferred time zone
      options={["Apple", "Google", "Outlook.com", "iCal"]}
      location={appointment.location || "Online"} // set event location if applicable
    />
  );
};

export default CalendarButton;
