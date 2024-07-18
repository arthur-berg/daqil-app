"use client";
import { Calendar } from "@/components/ui/calendar";
import { useState, useTransition } from "react";
import { add, format, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { bookAppointment } from "@/actions/appointments";
import { Link } from "@/navigation";
import { currencyToSymbol } from "@/utils";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const BookingCalendar = ({
  appointmentType,
  therapistId,
}: {
  appointmentType: any;
  therapistId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });

  const getTimes = () => {
    if (!date.justDate) return;

    const { justDate } = date;

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
      {success || error ? (
        <div className="mt-4 p-4 border rounded">
          {success && (
            <div className="bg-green-100 border border-green-300 p-2 rounded">
              <p>{success}</p>
              <Link href="/client/appointments">
                <Button className="mt-2">Go to appointments overview</Button>
              </Link>
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => {
                  setSuccess(undefined);
                  setError(undefined);
                  setDate({
                    justDate: undefined,
                    dateTime: undefined,
                  });
                }}
              >
                Book another appointment
              </Button>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 p-2 rounded">
              <p>{error}</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex">
            <h2 className="text-xl font-bold mb-4 mr-4">Calendar</h2>
            {date.justDate && (
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  setDate({
                    justDate: undefined,
                    dateTime: undefined,
                  })
                }
              >
                Go back
              </Button>
            )}
          </div>
          {date.justDate ? (
            <>
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
              <div className="flex gap-4 flex-wrap mt-2">
                {times?.map((time, i) => (
                  <div key={`time-${i}`} className="rounded-sm bg-gray-100 p-2">
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        setDate((prev) => ({ ...prev, dateTime: time }))
                      }
                    >
                      {format(time, "kk:mm")}
                    </Button>
                  </div>
                ))}
              </div>
              {date.dateTime && date.justDate && (
                <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
                  <p>Appointment Details:</p>
                  <p>Day: {format(date.dateTime, "eeee, MMMM d, yyyy")}</p>
                  <p>Time: {format(date.dateTime, "kk:mm")}</p>
                  <p>Duration: {appointmentType.durationInMinutes} minutes</p>
                  <p>
                    Cost: {currencyToSymbol(appointmentType.currency)}
                    {appointmentType.price}{" "}
                  </p>
                  <Button
                    className="mt-2"
                    disabled={isPending}
                    onClick={() => {
                      const combinedDateTime = set(date.justDate as Date, {
                        hours: date?.dateTime?.getHours(),
                        minutes: date?.dateTime?.getMinutes(),
                      });
                      // Add booking logic here
                      startTransition(async () => {
                        const data = await bookAppointment(
                          appointmentType,
                          therapistId,
                          combinedDateTime
                        );

                        if (data.success) {
                          setSuccess(data.success);
                          setError(undefined);
                        } else if (data.error) {
                          setError(data.error);
                          setSuccess(undefined);
                        }
                      });
                    }}
                  >
                    Confirm Booking
                  </Button>
                </div>
              )}
            </>
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
      )}
    </>
  );
};

export default BookingCalendar;
