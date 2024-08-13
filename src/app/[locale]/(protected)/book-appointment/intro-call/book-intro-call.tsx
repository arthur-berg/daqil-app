"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState, useTransition } from "react";
import { format, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const hardcodedTimeSlots = [
  { start: new Date(2023, 8, 20, 9, 0), end: new Date(2023, 8, 20, 9, 15) },
  { start: new Date(2023, 8, 20, 11, 0), end: new Date(2023, 8, 20, 11, 15) },
  { start: new Date(2023, 8, 20, 14, 0), end: new Date(2023, 8, 20, 14, 15) },
  { start: new Date(2023, 8, 20, 16, 0), end: new Date(2023, 8, 20, 16, 15) },
];

const BookIntroCall = () => {
  const t = useTranslations("BookAppointmentPage");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [availableTimeSlots, setAvailableTimeSlots] =
    useState<{ start: Date; end: Date }[]>(hardcodedTimeSlots);
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });

  const today = set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const groupTimeSlots = (slots: { start: Date; end: Date }[]) => {
    const morning = slots.filter((slot) => slot.start.getHours() < 12);
    const afternoon = slots.filter(
      (slot) => slot.start.getHours() >= 12 && slot.start.getHours() < 17
    );
    const evening = slots.filter((slot) => slot.start.getHours() >= 17);

    return { morning, afternoon, evening };
  };

  return (
    <div className=" mt-6 bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{t("scheduleIntroCall")}</h2>
      {success || error ? (
        <div className="mt-4 p-4 border rounded">
          {success && (
            <div className="bg-green-100 border border-green-300 p-2 rounded">
              <p>{success}</p>
              <Button
                variant="outline"
                className="ml-2 rtl:ml-0 rtl:mr-2"
                onClick={() => {
                  setSuccess(undefined);
                  setError(undefined);
                  setDate({
                    justDate: undefined,
                    dateTime: undefined,
                  });
                }}
              >
                {t("bookAnotherAppointment")}
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
            <h2 className="text-xl font-bold mb-4 mr-4">{t("calendar")}</h2>
          </div>
          {date.dateTime && date.justDate ? (
            <>
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  setDate((prev) => ({
                    ...prev,
                    justDate: undefined,
                  }))
                }
              >
                {t("goBack")}
              </Button>
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded">
                <p>{t("appointmentDetails")}:</p>
                <p>
                  {t("day")}: {format(date.dateTime, "eeee, MMMM d, yyyy")}
                </p>
                <p>
                  {t("time")}: {format(date.dateTime, "kk:mm")}
                </p>
                <Button
                  className="mt-2"
                  disabled={isPending}
                  onClick={() => {
                    const combinedDateTime = set(date.justDate as Date, {
                      hours: date?.dateTime?.getHours(),
                      minutes: date?.dateTime?.getMinutes(),
                    });
                    startTransition(async () => {
                      // Replace with your booking logic
                      const data = { success: true }; // Mocking success response

                      if (data.success) {
                        setSuccess("Your appointment is confirmed!");
                        setError(undefined);
                      } else {
                        setError(
                          "There was an error booking your appointment."
                        );
                        setSuccess(undefined);
                      }
                    });
                  }}
                >
                  {t("confirmBooking")}
                </Button>
              </div>
            </>
          ) : date.justDate ? (
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
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  {t("availableSlots")}
                </h3>
                {Object.entries(groupTimeSlots(availableTimeSlots)).map(
                  ([timeOfDay, slots], idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="text-md font-medium mb-2 capitalize text-blue-600">
                        {t(timeOfDay)}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {slots.length ? (
                          slots.map((time, i) => (
                            <Button
                              key={`time-${i}`}
                              disabled={isPending}
                              className="mb-2"
                              onClick={() =>
                                setDate((prev) => ({
                                  ...prev,
                                  dateTime: time.start,
                                }))
                              }
                            >
                              {format(time.start, "kk:mm")} -{" "}
                              {format(time.end, "kk:mm")}
                            </Button>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">
                            {t("noSlotsAvailable")}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <Calendar
              mode="single"
              selected={date.justDate ? date.justDate : undefined}
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
    </div>
  );
};

export default BookIntroCall;
