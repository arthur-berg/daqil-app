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
  appointmentTypes,
  availableTimesJson,
  adminPageProps,
}: {
  appointmentTypes: any[];
  availableTimesJson: any;
  adminPageProps?: { therapistId: string };
}) => {
  const t = useTranslations("AvailabilityPage");

  const [activeTab, setActiveTab] = useState("overview");

  const availableTimes = JSON.parse(availableTimesJson);

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
              <Overview
                availableTimes={availableTimes}
                appointmentTypes={appointmentTypes}
              />
            </TabsContent>
            <TabsContent value="default-availability">
              <RecurringAvailabilityManager
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                settings={availableTimes?.settings}
                recurringAvailableTimes={
                  availableTimes?.recurringAvailableTimes
                }
              />
            </TabsContent>
            <TabsContent value="non-recurring-times">
              <NonRecurringAvailabilityForm
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                nonRecurringAvailableTimes={
                  availableTimes?.nonRecurringAvailableTimes
                }
              />
            </TabsContent>
            <TabsContent value="block-dates">
              <BlockAvailabilityForm
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                blockedOutTimes={availableTimes?.blockedOutTimes}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Dropdown for mobile screens (md and down) */}
      <div className="block md:hidden bg-white shadow-md rounded-lg md:p-6">
        <div className="sm:flex sm:justify-center p-6">
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

        <div className="bg-white rounded-lg md:p-6">
          {activeTab === "overview" && (
            <Overview
              availableTimes={availableTimes}
              appointmentTypes={appointmentTypes}
            />
          )}
          {activeTab === "default-availability" && (
            <div className="p-6">
              <RecurringAvailabilityManager
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                settings={availableTimes?.settings}
                recurringAvailableTimes={
                  availableTimes?.recurringAvailableTimes
                }
              />
            </div>
          )}
          {activeTab === "non-recurring-times" && (
            <div className="p-6">
              <NonRecurringAvailabilityForm
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                nonRecurringAvailableTimes={
                  availableTimes?.nonRecurringAvailableTimes
                }
              />
            </div>
          )}
          {activeTab === "block-dates" && (
            <div className="p-6">
              <BlockAvailabilityForm
                adminPageProps={adminPageProps}
                appointmentTypes={appointmentTypes}
                blockedOutTimes={availableTimes?.blockedOutTimes}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTabs;
