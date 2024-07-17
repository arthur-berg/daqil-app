"use client";

import { useState } from "react";
import { format, set, addMinutes, isBefore, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DefaultAvailabilityManager from "./default-availability-manager";

type Times = {
  startDate: Date;
  endDate: Date;
};

const AvailabilityBody = ({
  occupiedTimes,
  appointmentType,
  availableTimes,
}: {
  occupiedTimes: Times[];
  appointmentType: any;
  availableTimes: any;
}) => {
  const [blockOutDates, setBlockOutDates] = useState<Date[]>([]);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);

  const handleBlockOutDateSelection = (date: Date) => {
    setBlockOutDates((prev) => {
      if (prev.some((d) => isEqual(d, date))) {
        return prev.filter((d) => !isEqual(d, date));
      } else {
        return [...prev, date];
      }
    });
  };

  const handleTimeSelection = (time: Date) => {
    if (selectedTimes.some((t) => isEqual(t, time))) {
      setSelectedTimes(selectedTimes.filter((t) => !isEqual(t, time)));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const saveTimes = () => {
    // Save selected times to the server
    // This is a placeholder for actual save logic
    console.log(
      "Saving times:",
      selectedTimes.map((time) => ({
        startDate: time,
        endDate: new Date(
          time.getTime() + appointmentType.durationInMinutes * 60000
        ),
      }))
    );
  };

  const saveBlockOutDates = () => {
    // Save block out dates to the server
    console.log("Saving block out dates:", blockOutDates);
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

  return (
    <Tabs defaultValue="default-availability" className="w-full">
      <TabsList>
        <TabsTrigger value="default-availability">
          Default Availability
        </TabsTrigger>
        <TabsTrigger value="specific-times">
          Select Specific Available Times
        </TabsTrigger>
        <TabsTrigger value="block-dates">Block Out Dates</TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6 flex">
        <TabsContent value="default-availability">
          <DefaultAvailabilityManager
            appointmentType={appointmentType}
            availableTimes={availableTimes}
            occupiedTimes={occupiedTimes}
          />
        </TabsContent>
        <TabsContent value="specific-times">
          <div>
            <h2 className="text-xl font-bold mb-4">
              Select Specific Available Times
            </h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                setSelectedTimes([]);
              }}
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

            {date && (
              <>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    Available Times for {format(date, "PPPP")}
                  </h3>
                  <div className="flex gap-4 flex-wrap">
                    {getTimesForDay(date).map((time, index) => (
                      <div
                        key={index}
                        className={`rounded-sm p-2 ${
                          selectedTimes.some((t) => isEqual(t, time))
                            ? "bg-blue-500"
                            : "bg-gray-100"
                        }`}
                      >
                        <Button
                          onClick={() => handleTimeSelection(time)}
                          className={
                            selectedTimes.some((t) => isEqual(t, time))
                              ? "bg-blue-500"
                              : ""
                          }
                        >
                          {format(time, "kk:mm")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedTimes.length > 0 && (
                  <div className="mt-4">
                    <Button onClick={saveTimes}>Save Available Times</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="block-dates">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Block Out Dates</h2>
            <Calendar
              mode="multiple"
              selected={blockOutDates}
              onSelect={(date) => handleBlockOutDateSelection(date)}
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
            <Button onClick={saveBlockOutDates}>Save Block Out Dates</Button>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AvailabilityBody;
