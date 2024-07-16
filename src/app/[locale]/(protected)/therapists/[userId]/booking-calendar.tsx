"use client";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { add, format, set } from "date-fns";
import { Button } from "@/components/ui/button";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const BookingCalendar = () => {
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });

  const getTimes = () => {
    if (!date.justDate) return;

    const { justDate } = date;

    /* 
    Logic to set all day available with interval
    const beginning = add(justDate, { hours: 9 }); 
    const end = add(justDate, { hours: 17 }); 
    const interval = 30;  
    
     for (let i = beginning; i <= end; i = add(i, { minutes: interval })) {
      times.push(i);
    }
    */

    const availableTimes = [
      add(justDate, { hours: 9 }),
      add(justDate, { hours: 17 }),
    ]; // get from therapist available times in DB

    return availableTimes;
  };

  const times = getTimes();
  const today = set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  return (
    <>
      {date.justDate ? (
        <div className="flex gap-4 flex-wrap">
          {times?.map((time, i) => (
            <div key={`time-${i}`} className="rounded-sm bg-gray-100 p-2">
              <Button
                onClick={() => setDate((prev) => ({ ...prev, dateTime: time }))}
              >
                {format(time, "kk:mm")}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Calendar
          mode="single"
          selected={date.justDate ? date.justDate : today}
          onSelect={(date) => {
            setDate((prev) => ({
              ...prev,
              justDate: date ? date : today,
            }));
          }}
          className="rounded-md border h-full w-full flex"
          classNames={{
            months:
              "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
            month: "space-y-4 w-full flex flex-col",
            table: "w-full h-full border-collapse space-y-1",
            head_row: "",
            row: "w-full mt-2",
          }}
        />
      )}
    </>
  );
};

export default BookingCalendar;
