"use client";

import { useState } from "react";
import { format, set, addMinutes, isBefore, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DefaultAvailabilityManager from "./default-availability-manager";
import SpecificAvailabilityForm from "./specific-availability-form";

const AvailabilityBody = ({
  appointmentType,
  availableTimes,
}: {
  appointmentType: any;
  availableTimes: any;
}) => {
  const [blockOutDates, setBlockOutDates] = useState<Date[]>([]);

  const handleBlockOutDateSelection = (date: Date) => {
    setBlockOutDates((prev) => {
      if (prev.some((d) => isEqual(d, date))) {
        return prev.filter((d) => !isEqual(d, date));
      } else {
        return [...prev, date];
      }
    });
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
      <TabsList className="flex items-center justify-start flex-wrap h-auto space-y-1">
        <TabsTrigger value="default-availability">
          Default Availability
        </TabsTrigger>
        <TabsTrigger value="specific-times">
          Select Specific Available Times
        </TabsTrigger>
        <TabsTrigger value="block-dates">Block Out Dates</TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <TabsContent value="default-availability">
          <DefaultAvailabilityManager
            appointmentType={appointmentType}
            settings={availableTimes?.settings}
            defaultAvailableTimes={availableTimes?.defaultAvailableTimes}
          />
        </TabsContent>
        <TabsContent value="specific-times">
          <SpecificAvailabilityForm
            specificAvailableTimes={availableTimes.specificAvailableTimes}
          />
        </TabsContent>
        <TabsContent value="block-dates">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Block Out Dates</h2>
            <Calendar
              mode="multiple"
              selected={blockOutDates}
              onSelect={(date: any) => handleBlockOutDateSelection(date)}
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
