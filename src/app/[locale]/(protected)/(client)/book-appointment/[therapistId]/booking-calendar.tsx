"use client";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState, useTransition } from "react";
import { addDays, format, isAfter, isBefore, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { bookIntroAppointment } from "@/actions/appointments/book-intro-appointment";
import { Link, useRouter } from "@/navigation";
import { currencyToSymbol } from "@/utils";
import { getTherapistAvailableTimeSlots } from "@/utils/therapistAvailability";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BeatLoader } from "react-spinners";
import { APPOINTMENT_TYPE_ID_INTRO_SESSION } from "@/contants/config";
import { reserveAppointment } from "@/actions/appointments/reserve-appointment";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";

type DateType = {
  justDate: Date | undefined;
  dateTime: Date | undefined;
};

const BookingCalendar = ({
  therapistId,
  therapistsAvailableTimes,
  appointments,
  setChangeTherapistDialogOpen,
  appointmentTypes,
  showOnlyIntroCalls,
  adminView,
}: {
  therapistId: string;
  therapistsAvailableTimes: string;
  appointments: string;
  setChangeTherapistDialogOpen?: (value: boolean) => void;
  appointmentTypes: any[];
  showOnlyIntroCalls: boolean;
  adminView?: boolean;
}) => {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("BookingCalendar");
  const tAppointmentTypes = useTranslations("AppointmentTypes");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });
  const router = useRouter();
  const { toast } = useToast();
  const [appointmentType, setAppointmentType] = useState(appointmentTypes[0]);
  const [showAddToCalendarDialog, setShowAddToCalendarDialog] = useState(false);
  const [closestAvailableDate, setClosestAvailableDate] = useState<Date | null>(
    null
  );

  const user = useCurrentUser();

  const userTimeZone = user?.settings?.timeZone as string;

  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const browserTimeZoneFormatted = formatTimeZoneWithOffset(browserTimeZone);

  const handleSetClosestAvailableDate = async (startingDate: Date) => {
    let currentDate = startingDate;
    const maxLookAheadDays = 30; // Define how many days ahead to search
    let foundAvailableSlots = false; // Track if we find available slots

    for (let i = 0; i < maxLookAheadDays; i++) {
      const allAvailableSlots = getTherapistAvailableTimeSlots(
        JSON.parse(therapistsAvailableTimes),
        appointmentType,
        currentDate,
        JSON.parse(appointments),
        browserTimeZone
      );

      if (allAvailableSlots.length > 0) {
        // Found available slots for this date
        setClosestAvailableDate(currentDate); // Set the closest available date
        setAvailableTimeSlots(allAvailableSlots); // Set available time slots for this date
        foundAvailableSlots = true;
        break; // Stop searching as we've found a date with available slots
      }

      currentDate = addDays(currentDate, 1); // Move to the next day
    }

    if (!foundAvailableSlots) {
      // No available slots were found within the given days
      setClosestAvailableDate(null); // No available dates found
      console.log("No available time slots found within 30 days.");
    }
  };

  useEffect(() => {
    if (!!appointmentType) {
      handleSetClosestAvailableDate(today);
    }
  }, [appointmentType]); // eslint-disable-line react-hooks/exhaustive-deps

  const setTimeSlots = (selectedDate: Date) => {
    if (!selectedDate) return [];

    const timeSlots = getTherapistAvailableTimeSlots(
      JSON.parse(therapistsAvailableTimes),
      appointmentType,
      selectedDate,
      JSON.parse(appointments),
      browserTimeZone
    );

    setAvailableTimeSlots(timeSlots);
  };

  const today = set(new Date(), {
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  const maxDate = addDays(today, 30);

  const groupTimeSlots = (slots: { start: Date; end: Date }[]) => {
    const morning = slots.filter((slot) => slot.start.getHours() < 12);
    const afternoon = slots.filter(
      (slot) => slot.start.getHours() >= 12 && slot.start.getHours() < 17
    );
    const evening = slots.filter((slot) => slot.start.getHours() >= 17);

    return { morning, afternoon, evening };
  };

  const handleTimeSlotClicked = () => {
    setBookingDialogOpen(false);
    const combinedDateTime = set(date.justDate as Date, {
      hours: date?.dateTime?.getHours(),
      minutes: date?.dateTime?.getMinutes(),
    });

    const isFree = appointmentType._id === APPOINTMENT_TYPE_ID_INTRO_SESSION;

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
            <div className="flex justify-center">
              <div className="w-64 sm:w-1/3 mb-4  sm:px-0">
                <Select
                  onValueChange={(value) => {
                    setDate({
                      justDate: undefined,
                      dateTime: undefined,
                    });
                    setAppointmentType(value);
                  }}
                  value={appointmentType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectAppointmentType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {appointmentTypes.map((appointmentType: any) => (
                        <SelectItem
                          key={appointmentType._id}
                          value={appointmentType}
                        >
                          {tAppointmentTypes(appointmentType._id)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
            {appointmentType && (
              <>
                <div className="flex">
                  <h2 className="text-xl font-bold mb-4 mr-4">
                    {t("calendar")}
                  </h2>
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
                                    className={cn(
                                      "mb-2",
                                      adminView && "cursor-not-allowed"
                                    )}
                                    onClick={() => {
                                      if (!adminView) {
                                        setDate((prev) => ({
                                          ...prev,
                                          dateTime: time.start,
                                        }));
                                        setBookingDialogOpen(true);
                                      }
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
            )}
          </>

          {setChangeTherapistDialogOpen &&
            typeof setChangeTherapistDialogOpen === "function" && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setChangeTherapistDialogOpen(true)}
                >
                  {t("changeTherapistButton")}
                </Button>
              </div>
            )}
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
              className="rtl:ml-2"
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

export default BookingCalendar;
