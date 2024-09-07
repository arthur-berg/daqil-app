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
import { CaretSortIcon, CheckIcon, TrashIcon } from "@radix-ui/react-icons";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { BlockAvailabilitySchemaFE } from "@/schemas";
import { saveBlockedOutTimes } from "@/actions/availability";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import BlockedOutTimes from "./blocked-out-times";
import { convertToUtcMidnight } from "@/utils";

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

const BlockAvailabilityForm = ({
  blockedOutTimes,
  appointmentTypes,
}: {
  blockedOutTimes: any;
  appointmentTypes: any[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState<any>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [startTimePopoverOpen, setStartTimePopoverOpen] = useState(false);
  const [endTimePopoverOpen, setEndTimePopoverOpen] = useState(false);
  const t = useTranslations("AvailabilityPage");

  const { responseToast } = useToast();

  const form = useForm<z.infer<typeof BlockAvailabilitySchemaFE>>({
    defaultValues: {
      date: new Date(),
      timeRanges: [{ startDate: "", endDate: "" }],
    },
  });

  const onSubmit = (values: any) => {
    const utcDate = convertToUtcMidnight(values.date);

    const formattedData = {
      date: utcDate,
      timeRanges: values.timeRanges.map(
        ({ startDate, endDate }: { startDate: string; endDate: string }) => ({
          startDate: set(utcDate, {
            hours: parseInt(startDate.split(":")[0], 10),
            minutes: parseInt(startDate.split(":")[1], 10),
            seconds: 0,
            milliseconds: 0,
          }),
          endDate: set(utcDate, {
            hours: parseInt(endDate.split(":")[0], 10),
            minutes: parseInt(endDate.split(":")[1], 10),
            seconds: 0,
            milliseconds: 0,
          }),
        })
      ),
    };

    startTransition(async () => {
      const data = await saveBlockedOutTimes(formattedData);
      setShowCalendar(false);
      responseToast(data);

      if (data?.success) {
        form.reset();
        setDate(null);
      }
    });
  };

  const removeTimeRange = (index: number) => {
    const currentTimeRanges = form.getValues("timeRanges");

    if (currentTimeRanges.length > 0) {
      const updatedTimeRanges = currentTimeRanges.filter(
        (_: any, i: number) => i !== index
      );
      form.setValue("timeRanges", updatedTimeRanges);

      form.trigger("timeRanges");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <BlockedOutTimes blockedOutTimes={blockedOutTimes} t={t} />
      </div>
      <Separator className="my-4" />

      <Button
        className="mb-2"
        disabled={isPending}
        variant={showCalendar ? "destructive" : undefined}
        onClick={() => setShowCalendar(!showCalendar)}
      >
        {showCalendar ? t("cancel") : t("addTimeSlot")}
      </Button>
      {showCalendar && (
        <>
          <div className="flex justify-center w-full">
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
              className="rounded-md border h-full w-full flex max-w-2xl"
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
          </div>

          {date && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    {t("blockTimesFor")} {format(date, "PPPP")}
                  </h3>
                  {form.watch("timeRanges").map((_: any, index: number) => (
                    <div key={index} className="flex gap-4 mt-4 flex-wrap">
                      <FormField
                        control={form.control}
                        name={`timeRanges.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Popover
                                open={startTimePopoverOpen}
                                onOpenChange={setStartTimePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[120px] justify-between"
                                    onClick={() =>
                                      setStartTimePopoverOpen(
                                        !startTimePopoverOpen
                                      )
                                    }
                                  >
                                    {field.value
                                      ? field.value
                                      : t("selectStartTime")}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[120px] p-0">
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
                                              setStartTimePopoverOpen(false);
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
                              <Popover
                                open={endTimePopoverOpen}
                                onOpenChange={setEndTimePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[120px] justify-between"
                                    onClick={() =>
                                      setEndTimePopoverOpen(!endTimePopoverOpen)
                                    }
                                  >
                                    {field.value
                                      ? field.value
                                      : t("selectEndTime")}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[120px] p-0">
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
                                              setEndTimePopoverOpen(false);
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
                      <Button
                        disabled={isPending}
                        variant="outline"
                        type="button"
                        onClick={() => removeTimeRange(index)}
                        className="flex items-center justify-center p-2"
                      >
                        <TrashIcon className="w-5 h-5 text-destructive hover:text-white" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    disabled={isPending}
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
                    <Button
                      type="submit"
                      variant="success"
                      disabled={isPending}
                    >
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

export default BlockAvailabilityForm;
