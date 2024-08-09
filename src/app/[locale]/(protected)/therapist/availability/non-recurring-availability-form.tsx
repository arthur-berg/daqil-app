"use client";
import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { format, set, addMinutes, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { NonRecurringAvailabilitySchemaFE } from "@/schemas";
import { saveNonRecurringAvailableTimes } from "@/actions/availability";
import { FaCalendarAlt } from "react-icons/fa";
import { TimeRange } from "@/generalTypes";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import NonRecurringTimes from "./non-recurring-times";

// Utility function to generate time options
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

const NonRecurringAvailabilityForm = ({
  nonRecurringAvailableTimes,
}: {
  nonRecurringAvailableTimes: any;
}) => {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState<any>();
  const [showCalendar, setShowCalendar] = useState(false);
  const { responseToast } = useToast();
  const t = useTranslations("AvailabilityPage");
  const ErrorMessages = useTranslations("ErrorMessages");
  const form = useForm<z.infer<typeof NonRecurringAvailabilitySchemaFE>>({
    defaultValues: {
      date: new Date(),
      timeRanges: [{ startDate: "", endDate: "" }],
    },
  });

  const onSubmit = (values: any) => {
    const formattedData = {
      date: values.date, // Use local date
      timeRanges: values.timeRanges.map(
        ({ startDate, endDate }: { startDate: string; endDate: string }) => ({
          startDate: set(new Date(date!), {
            hours: parseInt(startDate.split(":")[0], 10),
            minutes: parseInt(startDate.split(":")[1], 10),
            seconds: 0,
            milliseconds: 0,
          }),
          endDate: set(new Date(date!), {
            hours: parseInt(endDate.split(":")[0], 10),
            minutes: parseInt(endDate.split(":")[1], 10),
            seconds: 0,
            milliseconds: 0,
          }),
        })
      ),
    };

    startTransition(async () => {
      const data = await saveNonRecurringAvailableTimes(formattedData);
      setShowCalendar(false);
      responseToast(data);
      if (data?.success) {
        form.reset();
        setDate(null);
      }
    });
  };

  return (
    <div>
      <div className="mb-8">
        <NonRecurringTimes
          nonRecurringAvailableTimes={nonRecurringAvailableTimes}
          t={t}
        />
      </div>

      <Separator className="my-4" />
      <Button
        className="mb-2"
        variant={showCalendar ? "destructive" : undefined}
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {showCalendar ? t("cancel") : t("addTimeSlot")}
      </Button>
      {showCalendar && (
        <>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              form.reset({
                date: date,
                timeRanges: [{ startDate: "", endDate: "" }],
              });
            }}
            className="rounded-md border h-full w-full flex"
            classNames={{
              months:
                "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
              month: "space-y-4 w-full flex-col",
              table: "w-full border-collapse space-y-1",
              head_row: "",
              row: "w-full",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected])]:rounded-md pb-2 pt-2",
            }}
          />

          {date && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    {t("setAvailableTimesFor")} {format(date, "PPPP")}
                  </h3>
                  {form.watch("timeRanges").map((_: any, index: number) => (
                    <div key={index} className="flex gap-4 mt-4">
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
                                    {field.value
                                      ? field.value
                                      : t("selectStartTime")}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[150px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder={t("searchTime")}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        {t("noTimeFound")}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {timeOptions.map((time) => (
                                          <CommandItem
                                            value={time}
                                            key={time}
                                            onSelect={() => {
                                              form.setValue(
                                                `timeRanges.${index}.startDate`,
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
                                    {field.value
                                      ? field.value
                                      : t("selectEndTime")}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[150px] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder={t("searchTime")}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        {t("noTimeFound")}
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
                  ))}
                  <Button
                    onClick={() =>
                      form.setValue("timeRanges", [
                        ...form.watch("timeRanges"),
                        { startDate: "", endDate: "" },
                      ])
                    }
                    type="button"
                    variant="outline"
                    className="mt-4"
                  >
                    {t("addTimeRange")}
                  </Button>
                </div>
                {form.watch("timeRanges").length > 0 && (
                  <div className="mt-4">
                    <Button type="submit" variant="success">
                      {t("saveTimeRanges")}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          )}
        </>
      )}
    </div>
  );
};

export default NonRecurringAvailabilityForm;
