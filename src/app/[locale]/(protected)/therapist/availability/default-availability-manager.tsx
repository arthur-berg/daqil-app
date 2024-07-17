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
import { DefaultAvailabilitySettingsSchema } from "@/schemas";
import { updateDefaultAvailabilitySettings } from "@/actions/availability";
import { useToast } from "@/components/ui/use-toast";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialEditModes = daysOfWeek.reduce((acc, day) => {
  acc[day] = false;
  return acc;
}, {});

const DefaultAvailabilityManager = ({
  appointmentType,
  defaultAvailable,
}: {
  appointmentType: any;
  defaultAvailable: any;
}) => {
  const [isPending, startTransition] = useTransition();

  const [timeRangeInputs, setTimeRangeInputs] = useState<{
    [key: string]: { from: string; to: string }[];
  }>({});
  const [editModes, setEditModes] = useState<{ [key: string]: boolean }>(
    initialEditModes
  );
  const { toast } = useToast();

  const defaultAvailabilityForm = useForm({
    resolver: zodResolver(DefaultAvailabilitySettingsSchema),
    defaultValues: {
      interval: 15,
      fullDayRange: {
        from: defaultAvailable?.settings?.fullDayRange?.from || "09:00",
        to: defaultAvailable?.settings?.fullDayRange?.to || "17:00",
      },
    },
  });

  useEffect(() => {
    const initialTimeRanges = {};
    defaultAvailable.availableTimes.forEach(({ day, timeRanges }) => {
      initialTimeRanges[day] = timeRanges.map(({ startDate, endDate }) => ({
        from: new Date(startDate).toTimeString().slice(0, 5),
        to: new Date(endDate).toTimeString().slice(0, 5),
      }));
    });
    setTimeRangeInputs(initialTimeRanges);
  }, [defaultAvailable.availableTimes]);

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
    values: z.infer<typeof DefaultAvailabilitySettingsSchema>
  ) => {
    startTransition(async () => {
      const data = await updateDefaultAvailabilitySettings(values);
      if (data.success) {
        toast({
          variant: "success",
          title: data.success,
        });
      }
    });
  };

  return timeRangeInputs ? (
    <div className="mt-6 bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Default Availability</h2>
      <Form {...defaultAvailabilityForm}>
        <form
          onSubmit={defaultAvailabilityForm.handleSubmit(
            onSubmitDefaultAvailability
          )}
        >
          <div className="mt-4">
            <FormField
              control={defaultAvailabilityForm.control}
              name="interval"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-lg font-semibold mb-2">
                    Set Interval (minutes)
                  </label>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="number"
                      {...field}
                      className="border rounded px-2 py-1 w-20"
                      min={1}
                    />
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
            <FormField
              control={defaultAvailabilityForm.control}
              name="fullDayRange.from"
              render={({ field }) => (
                <FormItem>
                  <label className="block text-lg font-semibold mb-2">
                    Available All Day Range
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        type="time"
                        {...field}
                        className="border rounded px-2 py-1"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormField
                      control={defaultAvailabilityForm.control}
                      name="fullDayRange.to"
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            disabled={isPending}
                            type="time"
                            {...field}
                            className="border rounded px-2 py-1"
                          />
                        </FormControl>
                      )}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
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
        <div key={day} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{day}</h3>
            <Button
              variant="outline"
              onClick={() => toggleEditModeForDay(day)}
              disabled={
                Object.values(editModes).some((mode) => mode) && !editModes[day]
              }
              className="w-24"
            >
              {editModes[day] ? "Cancel" : "Edit"}
            </Button>
          </div>
          {editModes[day] ? (
            <DefaultAvailabilityForm
              editModes={editModes}
              setEditModes={setEditModes}
              day={day}
              timeRangeInputs={timeRangeInputs}
              setTimeRangeInputs={setTimeRangeInputs}
              fullDayRange={defaultAvailable?.settings?.fullDayRange}
            />
          ) : (
            <div className="flex flex-col space-y-2">
              {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
                timeRangeInputs[day].map((range, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="time"
                      value={range.from}
                      disabled={!editModes[day]}
                      onChange={(e) =>
                        handleTimeRangeChange(
                          day,
                          index,
                          "from",
                          e.target.value
                        )
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
                    <input
                      type="time"
                      value={range.to}
                      disabled={!editModes[day]}
                      onChange={(e) =>
                        handleTimeRangeChange(day, index, "to", e.target.value)
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
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
