"use client";
import { useEffect, useState, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DefaultAvailabilityForm from "@/app/[locale]/(protected)/therapist/availability/default-availability-form";
import { BeatLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { DefaultAvailabilitySettingsSchemaFE } from "@/schemas";
import { updateDefaultAvailabilitySettings } from "@/actions/availability";
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
import { addMinutes, isBefore, set } from "date-fns";

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

const initialEditModes = daysOfWeek.reduce((acc, day) => {
  acc[day] = false;
  return acc;
}, {});

const DefaultAvailabilityManager = ({
  appointmentType,
  defaultAvailableTimes,
  settings,
}: {
  appointmentType: any;
  defaultAvailableTimes: any[];
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

  const fullDayRange = {
    from: settings?.fullDayRange?.from || "09:00",
    to: settings?.fullDayRange?.to || "17:00",
  };

  const form = useForm({
    resolver: zodResolver(DefaultAvailabilitySettingsSchemaFE),
    defaultValues: {
      interval: settings.interval.toString() ?? "15",
      fullDayRange,
    },
  });

  useEffect(() => {
    const initialTimeRanges = {};
    defaultAvailableTimes?.forEach(({ day, timeRanges }) => {
      initialTimeRanges[day] = timeRanges.map(({ startDate, endDate }) => ({
        from: new Date(startDate).toTimeString().slice(0, 5),
        to: new Date(endDate).toTimeString().slice(0, 5),
      }));
    });
    setTimeRangeInputs(initialTimeRanges);
  }, [defaultAvailableTimes]);

  const toggleEditModeForDay = (day: string) => {
    setEditModes((prev) => {
      const newEditModes = { ...prev };
      Object.keys(newEditModes).forEach((key) => {
        newEditModes[key] = key === day ? !newEditModes[key] : false;
      });
      return newEditModes;
    });
  };

  const handleTimeRangeChange = (
    day: string,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    setTimeRangeInputs((prev) => {
      const newRanges = [...(prev[day] || [])];
      newRanges[index][field] = value;
      return { ...prev, [day]: newRanges };
    });
  };

  const onSubmitDefaultAvailability = (
    values: z.infer<typeof DefaultAvailabilitySettingsSchemaFE>
  ) => {
    startTransition(async () => {
      const structuredData = {
        ...values,
        interval: parseInt(values.interval),
      };
      const data = await updateDefaultAvailabilitySettings(structuredData);
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
      <h2 className="text-xl font-bold mb-4">Default Availability</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitDefaultAvailability)}>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-lg font-semibold mb-2">
                    Set Interval (minutes)
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
                            <CommandEmpty>No interval found.</CommandEmpty>
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
                    The interval determines the time gaps between each available
                    slot. For example, if you set the interval to 15 minutes,
                    your available slots will be at 9:00, 9:15, 9:30, etc. We
                    don't recommend an interval of less than 15 minutes to
                    ensure you have enough time between sessions.
                  </p>
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <label className="block text-lg font-semibold mb-2">
              Available All Day Range
            </label>
            <div className="flex">
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
          </div>
          <Button
            type="submit"
            variant="success"
            className="mt-4"
            disabled={isPending}
          >
            Save Settings
          </Button>
        </form>
      </Form>
      {daysOfWeek.map((day) => (
        <div key={day} className="mb-8 mt-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-semibold">
                {capitalizeFirstLetter(day)}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleEditModeForDay(day)}
                disabled={
                  Object.values(editModes).some((mode) => mode) &&
                  !editModes[day]
                }
                className="w-24"
              >
                {editModes[day] ? "Cancel" : "Edit"}
              </Button>
            </div>
          </div>
          {editModes[day] ? (
            <DefaultAvailabilityForm
              editModes={editModes}
              setEditModes={setEditModes}
              day={day}
              timeRangeInputs={timeRangeInputs}
              setTimeRangeInputs={setTimeRangeInputs}
              fullDayRange={fullDayRange}
            />
          ) : (
            <div className="flex flex-col space-y-2">
              {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
                timeRangeInputs[day].map((range, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="border rounded px-2 py-1 w-24 text-center">
                      {range.from}
                    </span>
                    <span className="border rounded px-2 py-1 w-24 text-center">
                      {range.to}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No default available times set</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <BeatLoader />
  );
};

export default DefaultAvailabilityManager;
