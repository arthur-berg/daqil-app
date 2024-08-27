"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTranslations } from "next-intl";
import { MdArrowDropDown } from "react-icons/md";

import RecurringAvailabilityManager from "./recurring-availability-manager";
import NonRecurringAvailabilityForm from "./non-recurring-availability-form";
import BlockAvailabilityForm from "./block-availability-form";
import Overview from "./overview";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AvailabilityTabs = ({
  appointmentType,
  availableTimes,
}: {
  appointmentType: any;
  availableTimes: any;
}) => {
  const t = useTranslations("AvailabilityPage");

  const [activeTab, setActiveTab] = useState("overview"); // state to manage active section for mobile

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const tabOptions = [
    { value: "overview", label: t("overview") },
    { value: "default-availability", label: t("recurringAvailableTimes") },
    { value: "non-recurring-times", label: t("nonRecurringAvailableTimes") },
    { value: "block-dates", label: t("blockedOutTimes") },
  ];

  return (
    <div className="w-full">
      {/* Tabs for larger screens (lg and up) */}
      <div className="hidden md:block">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="flex items-center justify-start flex-wrap h-auto">
            {tabOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 bg-white shadow-md rounded-lg p-6">
            <TabsContent value="overview">
              <Overview availableTimes={availableTimes} />
            </TabsContent>
            <TabsContent value="default-availability">
              <RecurringAvailabilityManager
                appointmentType={appointmentType}
                settings={availableTimes?.settings}
                recurringAvailableTimes={
                  availableTimes?.recurringAvailableTimes
                }
              />
            </TabsContent>
            <TabsContent value="non-recurring-times">
              <NonRecurringAvailabilityForm
                nonRecurringAvailableTimes={
                  availableTimes?.nonRecurringAvailableTimes
                }
              />
            </TabsContent>
            <TabsContent value="block-dates">
              <BlockAvailabilityForm
                blockedOutTimes={availableTimes?.blockedOutTimes}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dropdown for mobile screens (md and down) */}
      <div className="block md:hidden bg-white shadow-md rounded-lg p-6">
        <div className="sm:flex sm:justify-center">
          <div className="sm:w-64">
            <Select onValueChange={handleTabChange} value={activeTab}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder={t("selectView")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tabOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6">
          {activeTab === "overview" && (
            <Overview availableTimes={availableTimes} />
          )}
          {activeTab === "default-availability" && (
            <RecurringAvailabilityManager
              appointmentType={appointmentType}
              settings={availableTimes?.settings}
              recurringAvailableTimes={availableTimes?.recurringAvailableTimes}
            />
          )}
          {activeTab === "non-recurring-times" && (
            <NonRecurringAvailabilityForm
              nonRecurringAvailableTimes={
                availableTimes?.nonRecurringAvailableTimes
              }
            />
          )}
          {activeTab === "block-dates" && (
            <BlockAvailabilityForm
              blockedOutTimes={availableTimes?.blockedOutTimes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTabs;
