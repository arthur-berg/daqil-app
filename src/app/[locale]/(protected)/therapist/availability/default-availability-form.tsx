"use client";
import * as z from "zod";
import { saveDefaultAvailableTimes } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { SaveDefaultAvailabilitySchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, isAfter, isBefore, isEqual, set } from "date-fns";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { TrashIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

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
import { PopoverClose } from "@radix-ui/react-popover";

const generateTimeIntervals = (intervalMinutes = 15) => {
  const times = [];
  const start = set(new Date(), {
    hours: 7, // Start at 9:00
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

const DefaultAvailabilityForm = ({
  day,
  timeRangeInputs,
  setTimeRangeInputs,
  editModes,
  setEditModes,
  fullDayRange,
}: {
  day: any;
  timeRangeInputs: any;
  setTimeRangeInputs: any;
  editModes: any;
  setEditModes: any;
  fullDayRange: any;
}) => {
  const [isPending, startTransition] = useTransition();
  const [popoverOpen, setIsPopoverOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(SaveDefaultAvailabilitySchema),
    defaultValues: {
      day,
      timeRanges:
        timeRangeInputs[day]?.map(({ from, to }: { from: any; to: any }) => ({
          startDate: from,
          endDate: to,
        })) || [],
    },
  });

  const isTimeRangeComplete = (day: string) => {
    return (timeRangeInputs[day] || []).every(
      ({ from, to }: { from: any; to: any }) => from && to
    );
  };

  const setAvailableFullDay = (day: string) => {
    const { from, to } = fullDayRange;
    setTimeRangeInputs((prev: any) => ({
      ...prev,
      [day]: [{ from, to }],
    }));

    // Programmatically set values in the form
    form.setValue(`timeRanges`, [{ startDate: from, endDate: to }]);
    form.trigger(`timeRanges`);
  };

  const removeTimeRange = (day: string, index: number) => {
    setTimeRangeInputs((prev: any) => {
      const newRanges = [...(prev[day] || [])];
      newRanges.splice(index, 1);

      // Update the form values programmatically
      form.setValue(
        `timeRanges`,
        newRanges.map(({ from, to }) => ({
          startDate: from,
          endDate: to,
        }))
      );
      form.trigger(`timeRanges`);

      return { ...prev, [day]: newRanges };
    });
  };

  const handleTimeRangeChange = (
    day: string,
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    setTimeRangeInputs((prev: any) => {
      const newRanges = [...(prev[day] || [])];
      newRanges[index][field] = value;
      return { ...prev, [day]: newRanges };
    });
  };

  const onSubmitDay = (
    values: z.infer<typeof SaveDefaultAvailabilitySchema>
  ) => {
    const newTimes = values.timeRanges.map(
      ({ startDate, endDate }: { startDate: any; endDate: any }) => {
        const [fromHour, fromMinute] = startDate.split(":").map(Number);
        const [toHour, toMinute] = endDate.split(":").map(Number);
        const startDateObj = set(new Date(), {
          hours: fromHour,
          minutes: fromMinute,
        });
        const endDateObj = set(new Date(), {
          hours: toHour,
          minutes: toMinute,
        });
        return { startDate: startDateObj, endDate: endDateObj };
      }
    );

    const structuredData = {
      day: values.day,
      timeRanges: newTimes,
    };

    startTransition(async () => {
      const data = await saveDefaultAvailableTimes(structuredData);
      if (data?.success) {
        toast({
          variant: "success",
          title: data.success,
        });
        setEditModes((prev: any) => ({ ...prev, [day]: false }));
      }
    });
  };

  const addTimeRange = (day: string) => {
    setTimeRangeInputs((prev: any) => ({
      ...prev,
      [day]: [...(prev[day] || []), { from: "", to: "" }],
    }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitDay)}>
        <div className="mb-8">
          <div className="flex flex-col space-y-2">
            {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
              timeRangeInputs[day].map((range: any, index: any) => (
                <div key={index} className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`timeRanges.${index}.startDate`}
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
                                      <CommandEmpty>
                                        No time found.
                                      </CommandEmpty>

                                      <CommandGroup>
                                        {timeOptions.map((time) => (
                                          <CommandItem
                                            value={time}
                                            key={time}
                                            onSelect={() => {
                                              console.log("time", time);
                                              form.setValue(
                                                `timeRanges.${index}.startDate`,
                                                time
                                              );

                                              handleTimeRangeChange(
                                                day,
                                                index,
                                                "from",
                                                time
                                              );
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
                        name={`timeRanges.${index}.endDate`}
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
                                      <CommandEmpty>
                                        No time found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {timeOptions.map((time) => (
                                          <CommandItem
                                            value={time}
                                            key={time}
                                            onSelect={() => {
                                              form.setValue(
                                                `timeRanges.${index}.endDate`,
                                                time
                                              );

                                              handleTimeRangeChange(
                                                day,
                                                index,
                                                "to",
                                                time
                                              );
                                            }}
                                          >
                                            {
                                              <CheckIcon
                                                className={`mr-2 h-4 w-4 ${
                                                  time === field.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                }`}
                                              />
                                            }
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
                  {editModes[day] && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => removeTimeRange(day, index)}
                      className="flex items-center justify-center p-2"
                    >
                      <TrashIcon className="w-5 h-5 text-destructive hover:text-white" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No default available times set</p>
            )}
          </div>
          {editModes[day] && (
            <div className="mt-4 sm:space-x-4 space-y-4 sm:space-y-0">
              <Button
                className="block sm:inline"
                onClick={() => addTimeRange(day)}
                variant="outline"
                type="button"
                disabled={isPending}
              >
                Add Time Range
              </Button>
              <Button
                className="block sm:inline"
                type="button"
                onClick={() => setAvailableFullDay(day)}
                disabled={isPending}
                variant="outline"
              >
                Set Available Full Day
              </Button>
              <Button
                className="block sm:inline"
                variant="success"
                type="submit"
                disabled={!isTimeRangeComplete(day) || isPending}
              >
                Save Time Ranges
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default DefaultAvailabilityForm;
