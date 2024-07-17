"use client";

import { useEffect, useState, useTransition } from "react";
import { addMinutes, isAfter, isBefore, isEqual, set } from "date-fns";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { saveDefaultAvailableTimes } from "@/actions/availability";
import { useToast } from "@/components/ui/use-toast";

type Times = {
  startDate: Date;
  endDate: Date;
};

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
  availableTimes,
  occupiedTimes,
}: {
  appointmentType: any;
  availableTimes: any;
  occupiedTimes: Times[];
}) => {
  const [isPending, startTransition] = useTransition();
  const [defaultAvailability, setDefaultAvailability] = useState<{
    [key: string]: Times[];
  }>({});
  const [timeRangeInputs, setTimeRangeInputs] = useState<{
    [key: string]: { from: string; to: string }[];
  }>({});
  const [fullDayRange, setFullDayRange] = useState({
    from: "09:00",
    to: "17:00",
  });
  const [editModes, setEditModes] = useState<{ [key: string]: boolean }>(
    initialEditModes
  );

  const { toast } = useToast();
  const [interval, setInterval] = useState<number>(15);

  useEffect(() => {
    const initialTimeRanges = {};
    availableTimes?.defaultAvailableTimes.forEach(({ day, timeRanges }) => {
      initialTimeRanges[day] = timeRanges.map(({ startDate, endDate }) => ({
        from: new Date(startDate).toTimeString().slice(0, 5),
        to: new Date(endDate).toTimeString().slice(0, 5),
      }));
    });
    setTimeRangeInputs(initialTimeRanges);
  }, [availableTimes]);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterval(parseInt(e.target.value, 10));
  };

  const handleFullDayRangeChange = (field: "from" | "to", value: string) => {
    setFullDayRange((prev) => ({ ...prev, [field]: value }));
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

  const addTimeRange = (day: string) => {
    setTimeRangeInputs((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { from: "", to: "" }],
    }));
  };

  const handleSaveTimeRanges = (day: string) => {
    const newTimes = (timeRangeInputs[day] || []).map(({ from, to }) => {
      const [fromHour, fromMinute] = from.split(":").map(Number);
      const [toHour, toMinute] = to.split(":").map(Number);
      const startDate = set(new Date(), {
        hours: fromHour,
        minutes: fromMinute,
      });
      const endDate = set(new Date(), { hours: toHour, minutes: toMinute });
      return { startDate, endDate };
    });

    const structuredData = {
      day,
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

    setDefaultAvailability((prev) => {
      return { ...prev, [day]: newTimes };
    });
  };

  const removeTimeRange = (day: string, index: number) => {
    setTimeRangeInputs((prev) => {
      const newRanges = [...(prev[day] || [])];
      newRanges.splice(index, 1);
      return { ...prev, [day]: newRanges };
    });
  };

  const setAvailableFullDay = (day: string) => {
    const [fromHour, fromMinute] = fullDayRange.from.split(":").map(Number);
    const [toHour, toMinute] = fullDayRange.to.split(":").map(Number);
    const startDate = set(new Date(), { hours: fromHour, minutes: fromMinute });
    const endDate = set(new Date(), { hours: toHour, minutes: toMinute });
    const timeRanges = getTimesForDay(new Date(startDate)).filter(
      (time) => !isTimeOccupied(time)
    );
    const newFullDayRange = {
      startDate,
      endDate: addMinutes(endDate, appointmentType.durationInMinutes),
    };

    setDefaultAvailability((prev) => ({
      ...prev,
      [day]: timeRanges.map((time) => ({
        startDate: time,
        endDate: addMinutes(time, appointmentType.durationInMinutes),
      })),
    }));
    setTimeRangeInputs((prev) => ({
      ...prev,
      [day]: [{ from: fullDayRange.from, to: fullDayRange.to }],
    }));
  };

  const getTimesForDay = (date: Date) => {
    const times = [];
    const startOfDay = set(date, {
      hours: 7,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });
    const endOfDay = set(date, {
      hours: 19,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    for (
      let time = startOfDay;
      isBefore(time, endOfDay);
      time = addMinutes(time, 15)
    ) {
      times.push(time);
    }
    return times;
  };

  const isTimeOccupied = (time: Date) => {
    return occupiedTimes.some(
      (occupied) =>
        (isAfter(time, occupied.startDate) ||
          isEqual(time, occupied.startDate)) &&
        (isBefore(time, occupied.endDate) || isEqual(time, occupied.endDate))
    );
  };

  const isTimeRangeComplete = (day: string) => {
    return (timeRangeInputs[day] || []).every(({ from, to }) => from && to);
  };

  const toggleEditModeForDay = (day: string) => {
    setEditModes((prev) => {
      const newEditModes = { ...prev };
      Object.keys(newEditModes).forEach((key) => {
        newEditModes[key] = key === day ? !newEditModes[key] : false;
      });
      return newEditModes;
    });
  };

  return (
    <div className="mt-6 bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Default Availability</h2>
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
          <div className="flex flex-col space-y-2">
            {timeRangeInputs[day] && timeRangeInputs[day].length > 0 ? (
              timeRangeInputs[day].map((range, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="time"
                    value={range.from}
                    disabled={!editModes[day]}
                    onChange={(e) =>
                      handleTimeRangeChange(day, index, "from", e.target.value)
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
                  {editModes[day] && (
                    <Button
                      variant="outline"
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
                disabled={isPending}
              >
                Add Time Range
              </Button>
              <Button
                onClick={() => setAvailableFullDay(day)}
                disabled={isPending}
                variant="outline"
              >
                Set Available Full Day
              </Button>
              <Button
                className="ml-8"
                variant="success"
                onClick={() => handleSaveTimeRanges(day)}
                disabled={!isTimeRangeComplete(day) || isPending}
              >
                Save Time Ranges
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DefaultAvailabilityManager;
