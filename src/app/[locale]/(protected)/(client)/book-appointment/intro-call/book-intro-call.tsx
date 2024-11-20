"use client";

import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState, useTransition } from "react";
import { addDays, format, isAfter, isBefore, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { BeatLoader } from "react-spinners";
import { Link, useRouter } from "@/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { currencyToSymbol } from "@/utils";
import { getTherapistAvailableTimeSlots } from "@/utils/therapistAvailability";
import { bookIntroAppointment } from "@/actions/appointments/book-intro-appointment";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { reserveAppointment } from "@/actions/appointments/reserve-appointment";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const BookIntroCall = ({
  appointmentType,
  therapistsJson,
}: {
  appointmentType: any;
  therapistsJson: any;
}) => {
  const t = useTranslations("BookingCalendar");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [closestAvailableDate, setClosestAvailableDate] = useState<Date | null>(
    null
  );

  const user = useCurrentUser();

  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });
  const router = useRouter();
  const { toast } = useToast();

  const therapists = JSON.parse(therapistsJson);

  const today = set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  const handleSetClosestAvailableDate = async (startingDate: Date) => {
    let currentDate = startingDate;
    const maxLookAheadDays = 30;
    let foundAvailableSlots = false;

    for (let i = 0; i < maxLookAheadDays; i++) {
      const allAvailableSlots = therapists.reduce(
        (slots: any, therapist: any) => {
          const therapistAvailableTimes = therapist.availableTimes;
          const therapistAppointments = therapist.appointments;

          const utcCurrentdDate = new Date(
            Date.UTC(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              currentDate.getHours(),
              currentDate.getMinutes(),
              currentDate.getSeconds()
            )
          );

          const introCallSlots = getTherapistAvailableTimeSlots(
            therapistAvailableTimes,
            appointmentType,
            utcCurrentdDate,
            therapistAppointments,
            browserTimeZone
          );

          return [...slots, ...introCallSlots];
        },
        []
      );

      if (allAvailableSlots.length > 0) {
        setClosestAvailableDate(currentDate);
        setAvailableTimeSlots(allAvailableSlots);
        foundAvailableSlots = true;
        break;
      }

      currentDate = addDays(currentDate, 1);
    }

    if (!foundAvailableSlots) {
      setClosestAvailableDate(null);
      console.log("No available time slots found within 30 days.");
    }
  };

  useEffect(() => {
    handleSetClosestAvailableDate(today);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groupTimeSlots = (slots: { start: Date; end: Date }[]) => {
    const morning = slots.filter((slot) => slot.start.getHours() < 12);
    const afternoon = slots.filter(
      (slot) => slot.start.getHours() >= 12 && slot.start.getHours() < 17
    );
    const evening = slots.filter((slot) => slot.start.getHours() >= 17);

    return { morning, afternoon, evening };
  };

  const setTimeSlots = async (selectedDate: Date) => {
    if (!selectedDate) return;

    try {
      const allAvailableSlots = therapists.reduce(
        (slots: any, therapist: any) => {
          const therapistAvailableTimes = therapist.availableTimes;
          const therapistAppointments = therapist.appointments;

          const utcSelectedDate = new Date(
            Date.UTC(
              selectedDate.getFullYear(),
              selectedDate.getMonth(),
              selectedDate.getDate(),
              selectedDate.getHours(),
              selectedDate.getMinutes(),
              selectedDate.getSeconds()
            )
          );

          const introCallSlots = getTherapistAvailableTimeSlots(
            therapistAvailableTimes,
            appointmentType,
            utcSelectedDate,
            therapistAppointments,
            browserTimeZone
          );

          return [...slots, ...introCallSlots];
        },
        []
      );

      setAvailableTimeSlots(allAvailableSlots);
    } catch (error) {
      console.error("Error fetching therapist data:", error);
      setAvailableTimeSlots([]);
    }
  };

  const selectTherapistWithFewestClients = (therapists: any[]) => {
    const sortedTherapists = therapists.sort(
      (a, b) => a.assignedClients.length - b.assignedClients.length
    );

    const therapistsWithFewestClients = sortedTherapists.filter(
      (therapist) =>
        therapist.assignedClients.length ===
        sortedTherapists[0].assignedClients.length
    );

    const selectedTherapistIndex = Math.floor(
      Math.random() * therapistsWithFewestClients.length
    );
    return therapistsWithFewestClients[selectedTherapistIndex];
  };

  const handleTimeSlotClicked = () => {
    setBookingDialogOpen(false);
    const combinedDateTime = set(date.justDate as Date, {
      hours: date?.dateTime?.getHours(),
      minutes: date?.dateTime?.getMinutes(),
    });

    const selectedTherapist = selectTherapistWithFewestClients(therapists);
    const therapistId = selectedTherapist._id;

    startTransition(async () => {
      const data = await reserveAppointment(
        appointmentType,
        therapistId,
        combinedDateTime,
        browserTimeZone
      );
      if (data.error) {
        toast({
          title: data.error,
          variant: "destructive",
        });
      }
      if (data.success) {
        router.push(`/checkout?appointmentId=${data.appointmentId}`);
      }
    });
  };

  const maxDate = addDays(today, 30);

  return (
    <>
      {isPending ? (
        <div className="flex flex-col items-center justify-center mt-10 pb-10">
          <BeatLoader />
          <div className="text-lg font-medium mt-5">
            {t("bookingAppointmentLoading")}
          </div>
        </div>
      ) : (
        <>
          <>
            <div className="mb-4">
              <Link href="/book-appointment">
                <Button variant="secondary">{t("goBack")}</Button>
              </Link>
            </div>
            {closestAvailableDate && (
              <div className="mb-4 p-4 bg-blue-100 rounded-md">
                <p className="text-blue-600 font-semibold">
                  {t("closestAvailableDate", {
                    date: format(closestAvailableDate, "eeee, MMMM d, yyyy"),
                  })}
                </p>
              </div>
            )}
            <div className="flex">
              <h2 className="text-xl font-bold mb-4 mr-4">{t("calendar")}</h2>
            </div>
            {date.justDate ? (
              <>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {t("availableSlotsFor", {
                      date: format(date.justDate, "eeee, MMMM d, yyyy"),
                    })}
                  </h3>
                  <Button
                    className="mb-4"
                    variant="secondary"
                    onClick={() => {
                      setDate({
                        justDate: undefined,
                        dateTime: undefined,
                      });
                    }}
                  >
                    {t("changeDate")}
                  </Button>

                  <div className="flex justify-center mb-4">
                    <p className="text-gray-600 text-md">
                      {t("timezoneNotice", {
                        timeZone: `${browserTimeZoneFormatted}`,
                      })}
                    </p>
                  </div>

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
                                className="mb-2"
                                onClick={() => {
                                  setDate((prev) => ({
                                    ...prev,
                                    dateTime: time.start,
                                  }));
                                  setBookingDialogOpen(true);
                                }}
                              >
                                {format(time.start, "HH:mm")} -{" "}
                                {format(time.end, "HH:mm")}
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
              <div className="flex justify-center sm:block">
                <Calendar
                  mode="single"
                  selected={date.justDate ? date.justDate : undefined}
                  onSelect={(date) => {
                    setDate((prev) => ({
                      ...prev,
                      justDate: date ? date : today,
                    }));
                    if (date) {
                      setTimeSlots(date);
                    }
                  }}
                  disabled={(date) => {
                    const november11th2024 = new Date(2024, 10, 11);
                    return (
                      isBefore(date, today) ||
                      isAfter(date, maxDate) ||
                      isBefore(date, november11th2024)
                    );
                  }}
                  className="w-full sm:max-w-none max-w-xs sm:w-auto overflow-hidden rounded-md border h-auto"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4",
                    month: "space-y-4 w-full flex flex-col",
                    table: "w-full border-collapse space-y-1",
                    head_row: "",
                    row: "w-full",
                  }}
                />
              </div>
            )}
          </>
        </>
      )}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("appointmentDetails")}</DialogTitle>
            <DialogDescription>
              <span className="block">
                <strong>{t("day")}:</strong>{" "}
                <span>
                  {date?.justDate &&
                    format(date?.justDate, "eeee, MMMM d, yyyy")}
                </span>
              </span>
              <span className="block">
                <strong>{t("time")}:</strong>{" "}
                <span>{date.dateTime && format(date.dateTime, "HH:mm")}</span>
              </span>
              <span className="block">
                <strong>{t("duration")}:</strong>{" "}
                <span>
                  {appointmentType.durationInMinutes} {t("minutes")}
                </span>
              </span>
              <span className="block">
                <strong>{t("cost")}:</strong>{" "}
                <span>
                  {appointmentType.price === 0
                    ? t("free")
                    : `${currencyToSymbol(appointmentType.currency)}${
                        appointmentType.price
                      }`}
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
            >
              {t("close")}
            </Button>
            <Button
              onClick={() => handleTimeSlotClicked()}
              className="mb-4 sm:mb-0"
            >
              {t("bookAppointment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookIntroCall;
