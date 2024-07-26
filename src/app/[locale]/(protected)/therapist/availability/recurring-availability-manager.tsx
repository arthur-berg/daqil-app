"use client";
import { useEffect, useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import RecurringAvailabilityForm from "@/app/[locale]/(protected)/therapist/availability/recurring-availability-form";
import { BeatLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DefaultAvailabilitySettingsSchemaFE } from "@/schemas";
import { updateRecurringAvailabilitySettings } from "@/actions/availability";
import { useToast } from "@/components/ui/use-toast";
import { capitalizeFirstLetter } from "@/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { addMinutes, format, isBefore, set } from "date-fns";
import { FaClock } from "react-icons/fa";
import { useTranslations } from "next-intl";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const generateTimeIntervals = (intervalMinutes = 15) => {
  const times = [];
  const start = set(new Date(), {
    hours: 6,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const end = set(new Date(), {
    hours: 23,
    minutes: 59,
    seconds: 0,
    milliseconds: 0,
  });

  let current = start;
  while (isBefore(current, end)) {
    times.push(current.toTimeString().slice(0, 5));
    current = addMinutes(current, intervalMinutes);
  }
  return times;
};

const timeOptions = generateTimeIntervals(15);

const initialEditModes = daysOfWeek.reduce((acc: any, day: any) => {
  acc[day] = false;
  return acc;
}, {});

const getInitialTimeRanges = (recurringAvailableTimes: any) => {
  const initialTimeRanges: {
    [key: string]: { from: string; to: string }[];
  } = {};
  recurringAvailableTimes?.forEach(({ day, timeRanges }: any) => {
    initialTimeRanges[day] = timeRanges.map(
      ({ startTime, endTime }: { startTime: string; endTime: string }) => ({
        from: startTime,
        to: endTime,
      })
    );
  });
  return initialTimeRanges;
};

const DefaultAvailabilityManager = ({
  appointmentType,
  recurringAvailableTimes,
  settings,
}: {
  appointmentType: any;
  recurringAvailableTimes: any[];
  settings: any;
}) => {
  const [isPending, startTransition] = useTransition();

  const [timeRangeInputs, setTimeRangeInputs] = useState<{
    [key: string]: { from: string; to: string }[];
  }>({});
  const [editModes, setEditModes] = useState<{ [key: string]: boolean }>(
    initialEditModes
  );
  const { toast } = useToast();

  const t = useTranslations("AvailabilityPage");

  const fullDayRange = {
    from: settings?.fullDayRange?.from || "09:00",
    to: settings?.fullDayRange?.to || "18:00",
  };

  const form = useForm({
    resolver: zodResolver(DefaultAvailabilitySettingsSchemaFE),
    defaultValues: {
      interval: settings?.interval.toString() ?? "15",
      fullDayRange,
    },
  });

  useEffect(() => {
    const initialTimeRanges = getInitialTimeRanges(recurringAvailableTimes);
    setTimeRangeInputs(initialTimeRanges);
  }, [recurringAvailableTimes]);

  const toggleEditModeForDay = (day: string) => {
    setEditModes((prev) => {
      const newEditModes = { ...prev };
      if (newEditModes[day]) {
        const initialTimeRanges = getInitialTimeRanges(recurringAvailableTimes);
        setTimeRangeInputs(initialTimeRanges);
      }
      Object.keys(newEditModes).forEach((key) => {
        newEditModes[key] = key === day ? !newEditModes[key] : false;
      });
      return newEditModes;
    });
  };

  /*   const handleTimeRangeChange = (
    day: string,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    setTimeRangeInputs((prev) => {
      const newRanges = [...(prev[day] || [])];
      newRanges[index][field] = value;
      // Filter out empty ranges
      const filteredRanges = newRanges.filter(({ from, to }) => from && to);
      return { ...prev, [day]: filteredRanges };
    });
  }; */

  const onSubmitDefaultAvailability = (
    values: z.infer<typeof DefaultAvailabilitySettingsSchemaFE>
  ) => {
    startTransition(async () => {
      const structuredData = {
        ...values,
        interval: parseInt(values.interval),
      };
      const data = await updateRecurringAvailabilitySettings(structuredData);
      if (data.success) {
        toast({
          variant: "success",
          title: data.success,
        });
      }
    });
  };

  const intervalOptions = ["15", "30", "45", "60"];

  return timeRangeInputs ? (
    <div className="mt-6 bg-white rounded-lg p-6">
      {/* <h2 className="text-xl font-bold mb-4">Recurring times & settings</h2> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitDefaultAvailability)}>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-lg font-semibold mb-2">
                    {t("setInterval")}
                  </label>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-[150px] justify-between"
                        >
                          {field.value ? field.value : "Select interval"}
                          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[150px] p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>{t("noIntervalFound")}</CommandEmpty>
                            <CommandGroup>
                              {intervalOptions.map((interval) => (
                                <CommandItem
                                  value={interval}
                                  key={interval}
                                  onSelect={() => {
                                    form.setValue("interval", interval);
                                  }}
                                >
                                  <CheckIcon
                                    className={`mr-2 h-4 w-4 ${
                                      interval === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  {interval}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm mt-2 max-w-72">
                    {t("intervalDescription")}
                  </p>
                </FormItem>
              )}
            />
          </div>
          {/*    <div className="mt-4">
            <label className="block text-lg font-semibold mb-2">
              Available All Day Range
            </label>

            <div className="flex flex-wrap space-y-2 md:space-y-0">
              <FormField
                control={form.control}
                name="fullDayRange.from"
                render={({ field }) => (
                  <FormItem className="mr-4">
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-[150px] justify-between"
                          >
                            {field.value ? field.value : "Select time"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[150px] p-0">
                          <Command>
                            <CommandInput placeholder="Search time..." />
                            <CommandList>
                              <CommandEmpty>No time found.</CommandEmpty>
                              <CommandGroup>
                                {timeOptions.map((time) => (
                                  <CommandItem
                                    value={time}
                                    key={time}
                                    onSelect={() => {
                                      form.setValue("fullDayRange.from", time);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        time === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {time}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullDayRange.to"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-[150px] justify-between"
                          >
                            {field.value ? field.value : "Select time"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[150px] p-0">
                          <Command>
                            <CommandInput placeholder="Search time..." />
                            <CommandList>
                              <CommandEmpty>No time found.</CommandEmpty>
                              <CommandGroup>
                                {timeOptions.map((time) => (
                                  <CommandItem
                                    value={time}
                                    key={time}
                                    onSelect={() => {
                                      form.setValue("fullDayRange.to", time);
                                    }}
                                  >
                                    <CheckIcon
                                      className={`mr-2 h-4 w-4 ${
                                        time === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {time}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div> */}

          <Button
            type="submit"
            variant="success"
            className="mt-4"
            disabled={isPending}
          >
            {t("saveSettings")}
          </Button>
        </form>
      </Form>
      <div
        className="bg-blue-100 border mt-4 border-blue-400 text-blue-700 px-4 py-3 rounded inline-flex text-sm"
        role="alert"
      >
        <span>{t("clientsWillSee")}</span>
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-blue-600 flex items-center mb-4 mt-4">
        <FaClock className="mr-2" /> {t("recurringAvailableTimes")}
      </h2>
      <div className="p-4 space-y-6 max-w-lg">
        {daysOfWeek.map((day) => (
          <div key={day} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-800">
                {capitalizeFirstLetter(day)}
              </h3>
              <Button
                variant="outline"
                onClick={() => toggleEditModeForDay(day)}
                disabled={
                  Object.values(editModes).some((mode) => mode) &&
                  !editModes[day]
                }
              >
                {editModes[day] ? "Cancel" : "Edit"}
              </Button>
            </div>
            {editModes[day] ? (
              <RecurringAvailabilityForm
                editModes={editModes}
                setEditModes={setEditModes}
                day={day}
                timeRangeInputs={timeRangeInputs}
                setTimeRangeInputs={setTimeRangeInputs}
                fullDayRange={fullDayRange}
              />
            ) : (
              <div className="space-y-2 space-x-2">
                {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
                  timeRangeInputs[day].map((range, index) => (
                    <div
                      key={index}
                      className="bg-blue-200 p-2 rounded-md text-blue-900 items-center inline-flex"
                    >
                      <span className="px-2 py-1 text-center">
                        {range.from}
                      </span>
                      <span className="px-2 py-1 text-center">{range.to}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">{t("noRecurringSet")}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <BeatLoader />
  );
};

export default DefaultAvailabilityManager;
