"use client";

import { useState } from "react";
import { format, set, addMinutes, isBefore, isEqual } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DefaultAvailabilityManager from "./recurring-availability-manager";
import SpecificAvailabilityForm from "./specific-availability-form";
import BlockAvailabilityForm from "./block-availability-form";
import Overview from "./overview";

const AvailabilityTabs = ({
  appointmentType,
  availableTimes,
}: {
  appointmentType: any;
  availableTimes: any;
}) => {
  return (
    <Tabs defaultValue="default-availability" className="w-full">
      <TabsList className="flex items-center justify-start flex-wrap h-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="default-availability">
          Recurring Available Times
        </TabsTrigger>
        <TabsTrigger value="specific-times">
          Specific Available Times
        </TabsTrigger>
        <TabsTrigger value="block-dates">Block Out Dates</TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <TabsContent value="overview">
          <Overview availableTimes={availableTimes} />
        </TabsContent>
        <TabsContent value="default-availability">
          <DefaultAvailabilityManager
            appointmentType={appointmentType}
            settings={availableTimes?.settings}
            recurringAvailableTimes={availableTimes?.recurringAvailableTimes}
          />
        </TabsContent>
        <TabsContent value="specific-times">
          <SpecificAvailabilityForm
            specificAvailableTimes={availableTimes?.specificAvailableTimes}
          />
        </TabsContent>
        <TabsContent value="block-dates">
          <BlockAvailabilityForm
            blockedOutTimes={availableTimes?.blockedOutTimes}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default AvailabilityTabs;
