"use client";
import * as z from "zod";
import { saveRecurringAvailableTimes } from "@/actions/availability";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { RecurringAvailabilitySchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, isBefore, set } from "date-fns";
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
import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";

const generateTimeIntervals = (intervalMinutes = 15) => {
  const times = [];
  const start = set(new Date(), {
    hours: 7,
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

const RecurringAvailabilityForm = ({
  day,
  timeRangeInputs,
  setTimeRangeInputs,
  editModes,
  setEditModes,
  appointmentTypes,
}: {
  day: any;
  timeRangeInputs: any;
  setTimeRangeInputs: any;
  editModes: any;
  setEditModes: any;
  appointmentTypes: any[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [startTimePopoverOpen, setStartTimePopoverOpen] = useState(false);
  const [endTimePopoverOpen, setEndTimePopoverOpen] = useState(false);
  const t = useTranslations("AvailabilityPage");

  const { responseToast } = useToast();

  const form = useForm({
    resolver: zodResolver(RecurringAvailabilitySchema),
    defaultValues: {
      day,
      timeRanges:
        timeRangeInputs[day]?.map(
          ({
            from,
            to,
            appointmentTypeIds,
          }: {
            from: any;
            to: any;
            appointmentTypeIds: string[];
          }) => ({
            startTime: from,
            endTime: to,
            appointmentTypeIds:
              appointmentTypeIds.length > 0
                ? appointmentTypeIds
                : appointmentTypes.map((type) => type._id),
          })
        ) || [],
    },
  });

  const isTimeRangeComplete = (day: string) => {
    return (timeRangeInputs[day] || []).every(
      ({ from, to }: { from: any; to: any }) => from && to
    );
  };

  const removeTimeRange = (day: string, index: number) => {
    setTimeRangeInputs((prev: any) => {
      const newRanges = [...(prev[day] || [])];
      newRanges.splice(index, 1);

      form.setValue(
        `timeRanges`,
        newRanges.map(({ from, to, appointmentTypeIds }, idx) => ({
          startTime: from,
          endTime: to,
          appointmentTypeIds: appointmentTypeIds || [],
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
      form.setValue(
        `timeRanges.${index}.${field === "from" ? "startTime" : "endTime"}`,
        value
      );
      form.trigger(`timeRanges`);
      return { ...prev, [day]: newRanges };
    });
  };

  const onSubmitDay = (values: z.infer<typeof RecurringAvailabilitySchema>) => {
    startTransition(async () => {
      const data = await saveRecurringAvailableTimes(values);
      responseToast(data);
      if (data?.success) {
        setEditModes((prev: any) => ({ ...prev, [day]: false }));
      }
    });
  };

  const addTimeRange = (day: string) => {
    setTimeRangeInputs((prev: any) => {
      const newTimeRange = {
        from: "",
        to: "",
        appointmentTypeIds: appointmentTypes.map((type) => type._id),
      };
      return {
        ...prev,
        [day]: [...(prev[day] || []), newTimeRange],
      };
    });

    const newIndex = timeRangeInputs[day] ? timeRangeInputs[day].length : 0;
    form.setValue(
      `timeRanges.${newIndex}.appointmentTypeIds`,
      appointmentTypes.map((type) => type._id)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitDay)}>
        <div className="mb-8">
          <div className="flex flex-col space-y-2">
            {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
              timeRangeInputs[day].map((range: any, index: any) => (
                <div key={index} className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Start time input */}
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 ">
                            <FormControl>
                              <Popover
                                open={startTimePopoverOpen}
                                onOpenChange={setStartTimePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[150px] justify-between"
                                    onClick={() =>
                                      setStartTimePopoverOpen(
                                        !startTimePopoverOpen
                                      )
                                    }
                                  >
                                    {field.value
                                      ? field.value
                                      : t("selectTime")}
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
                                                `timeRanges.${index}.startTime`,
                                                time
                                              );
                                              handleTimeRangeChange(
                                                day,
                                                index,
                                                "from",
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
                          </div>
                        </FormItem>
                      )}
                    />
                    {/* End time input */}
                    <FormField
                      control={form.control}
                      name={`timeRanges.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Popover
                                open={endTimePopoverOpen}
                                onOpenChange={setEndTimePopoverOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-[150px] justify-between"
                                    onClick={() =>
                                      setEndTimePopoverOpen(!endTimePopoverOpen)
                                    }
                                  >
                                    {field.value
                                      ? field.value
                                      : t("selectTime")}
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
                                                `timeRanges.${index}.endTime`,
                                                time
                                              );
                                              handleTimeRangeChange(
                                                day,
                                                index,
                                                "to",
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
                          </div>
                        </FormItem>
                      )}
                    />
                    {/* Trash icon */}
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

                  {/* Appointment type checkboxes */}
                  <FormField
                    control={form.control}
                    name={`timeRanges.${index}.appointmentTypeIds`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-wrap mt-2 mb-8 border-b-2 border-primary pb-2">
                          {appointmentTypes.map((type) => (
                            <div
                              key={type._id}
                              className="flex items-center mr-4"
                            >
                              <Checkbox
                                id={`${day}-${index}-${type._id}`}
                                checked={field?.value?.includes(type._id)}
                                onCheckedChange={() => {
                                  const currentValue = Array.isArray(
                                    field.value
                                  )
                                    ? field.value
                                    : [];
                                  const updatedIds = currentValue.includes(
                                    type._id
                                  )
                                    ? currentValue.filter(
                                        (id: string) => id !== type._id
                                      )
                                    : [...currentValue, type._id];
                                  form.setValue(
                                    `timeRanges.${index}.appointmentTypeIds`,
                                    updatedIds
                                  );
                                  form.trigger(
                                    `timeRanges.${index}.appointmentTypeIds`
                                  );
                                }}
                              />
                              <label
                                htmlFor={`${day}-${index}-${type._id}`}
                                className="ml-2"
                              >
                                {type.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t("noRecurringSet")}</p>
            )}
          </div>
          {/* Add appointment type selection UI here */}

          {editModes[day] && (
            <div className="mt-4 sm:space-x-4 space-y-4 sm:space-y-0">
              <Button
                className="block sm:inline"
                onClick={() => addTimeRange(day)}
                variant="outline"
                type="button"
                disabled={isPending}
              >
                {t("addTimeRange")}
              </Button>
              <Button
                className="block sm:inline"
                variant="success"
                type="submit"
                disabled={!isTimeRangeComplete(day) || isPending}
              >
                {t("saveTimeRanges")}
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};

export default RecurringAvailabilityForm;
