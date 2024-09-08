"use client";
import { Calendar } from "@/components/ui/calendar";
import { useState, useTransition } from "react";
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
}: {
  therapistId: string;
  therapistsAvailableTimes: string;
  appointments: string;
  setChangeTherapistDialogOpen?: (value: boolean) => void;
  appointmentTypes: any[];
  showOnlyIntroCalls: boolean;
}) => {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("BookingCalendar");
  const tAppointmentTypes = useTranslations("AppointmentTypes");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { start: Date; end: Date }[]
  >([]);
  const [date, setDate] = useState<DateType>({
    justDate: undefined,
    dateTime: undefined,
  });
  const router = useRouter();
  const [reservedAppointment, setReservedAppointment] = useState<any>(null);
  const { toast } = useToast();
  const [appointmentType, setAppointmentType] = useState(
    showOnlyIntroCalls ? appointmentTypes[0] : ""
  );

  const setTimeSlots = (selectedDate: Date) => {
    if (!selectedDate) return [];

    const timeSlots = getTherapistAvailableTimeSlots(
      JSON.parse(therapistsAvailableTimes),
      appointmentType,
      selectedDate,
      JSON.parse(appointments)
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

    if (isFree) {
      startTransition(async () => {
        const data = await bookIntroAppointment(
          appointmentType,
          therapistId,
          combinedDateTime
        );
        if (data.error) {
          toast({
            title: data.error,
            variant: "destructive",
          });
        }
        if (data.success) {
          router.push(`/appointments`);
        }
      });
    } else {
      startTransition(async () => {
        const data = await reserveAppointment(
          appointmentType,
          therapistId,
          combinedDateTime
        );
        if (data.error) {
          toast({
            title: data.error,
            variant: "destructive",
          });
        }
        if (data.success) {
          router.push(
            `/checkout?appointmentId=${data.appointmentId}&appointmentTypeId=${
              appointmentType._id
            }&date=${encodeURIComponent(
              combinedDateTime.toString()
            )}&therapistId=${therapistId}`
          );
        }
      });
    }
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
              <div className="w-3/4 sm:w-1/3 mb-4  sm:px-0">
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
            {appointmentType && (
              <>
                <div className="flex">
                  <h2 className="text-xl font-bold mb-4 mr-4">
                    {t("calendar")}
                  </h2>
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
                        if (date) {
                          setTimeSlots(date);
                        }
                      }}
                      disabled={(date) =>
                        isBefore(date, today) || isAfter(date, maxDate)
                      }
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
                    disabled={(date) =>
                      isBefore(date, today) || isAfter(date, maxDate)
                    }
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
              <div>
                <strong>{t("day")}:</strong>{" "}
                <span>
                  {date?.justDate &&
                    format(date?.justDate, "eeee, MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <strong>{t("time")}:</strong>{" "}
                <span>{date.dateTime && format(date.dateTime, "HH:mm")}</span>
              </div>
              <div>
                <strong>{t("duration")}:</strong>{" "}
                <span>
                  {appointmentType.durationInMinutes} {t("minutes")}
                </span>
              </div>
              <div>
                <strong>{t("cost")}:</strong>{" "}
                <span>
                  {appointmentType.price === 0
                    ? t("free")
                    : `${currencyToSymbol(appointmentType.currency)}${
                        appointmentType.price
                      }`}
                </span>
              </div>
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
              className="rtl:ml-2 mb-4 sm:mb-0"
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
