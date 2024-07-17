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
import { TrashIcon } from "@radix-ui/react-icons";

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

  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(SaveDefaultAvailabilitySchema),
    defaultValues: {
      day,
      timeRanges:
        timeRangeInputs[day]?.map(({ from, to }) => ({
          startDate: from,
          endDate: to,
        })) || [],
    },
  });

  const isTimeRangeComplete = (day: string) => {
    return (timeRangeInputs[day] || []).every(({ from, to }) => from && to);
  };

  const setAvailableFullDay = (day: string) => {
    const { from, to } = fullDayRange;
    setTimeRangeInputs((prev) => ({
      ...prev,
      [day]: [{ from, to }],
    }));

    // Programmatically set values in the form
    form.setValue(`timeRanges`, [{ startDate: from, endDate: to }]);
    form.trigger(`timeRanges`);
  };

  const removeTimeRange = (day: string, index: number) => {
    setTimeRangeInputs((prev) => {
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
    setTimeRangeInputs((prev) => {
      const newRanges = [...(prev[day] || [])];
      newRanges[index][field] = value;
      return { ...prev, [day]: newRanges };
    });
  };

  const onSubmitDay = (
    values: z.infer<typeof SaveDefaultAvailabilitySchema>
  ) => {
    const newTimes = values.timeRanges.map(({ startDate, endDate }) => {
      const [fromHour, fromMinute] = startDate.split(":").map(Number);
      const [toHour, toMinute] = endDate.split(":").map(Number);
      const startDateObj = set(new Date(), {
        hours: fromHour,
        minutes: fromMinute,
      });
      const endDateObj = set(new Date(), { hours: toHour, minutes: toMinute });
      return { startDate: startDateObj, endDate: endDateObj };
    });

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
        setEditModes((prev) => ({ ...prev, [day]: false }));
      }
    });
  };

  const addTimeRange = (day: string) => {
    setTimeRangeInputs((prev) => ({
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
                <div key={index} className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`timeRanges.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input
                                type="time"
                                {...field}
                                value={field.value || range.from}
                                disabled={!editModes[day]}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleTimeRangeChange(
                                    day,
                                    index,
                                    "from",
                                    e.target.value
                                  );
                                }}
                                className="border rounded px-2 py-1 w-24"
                              />
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
                              <input
                                type="time"
                                {...field}
                                value={field.value || range.to}
                                disabled={!editModes[day]}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleTimeRangeChange(
                                    day,
                                    index,
                                    "to",
                                    e.target.value
                                  );
                                }}
                                className="border rounded px-2 py-1 w-24"
                              />
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
            <div className="mt-4 space-x-4">
              <Button
                onClick={() => addTimeRange(day)}
                variant="outline"
                type="button"
                disabled={isPending}
              >
                Add Time Range
              </Button>
              <Button
                type="button"
                onClick={() => setAvailableFullDay(day)}
                disabled={isPending}
                variant="outline"
              >
                Set Available Full Day
              </Button>
              <Button
                className="ml-8"
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
