"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

import RecurringAvailabilityManager from "./recurring-availability-manager";
import NonRecurringAvailabilityForm from "./non-recurring-availability-form";
import BlockAvailabilityForm from "./block-availability-form";
import Overview from "./overview";

const AvailabilityTabs = ({
  appointmentType,
  availableTimes,
}: {
  appointmentType: any;
  availableTimes: any;
}) => {
  const t = useTranslations("AvailabilityPage");
  return (
    <Tabs defaultValue="default-availability" className="w-full">
      <TabsList className="flex items-center justify-start flex-wrap h-auto">
        <TabsTrigger value="overview">{t("overview")}</TabsTrigger>
        <TabsTrigger value="default-availability">
          {t("recurringAvailableTimes")}
        </TabsTrigger>
        <TabsTrigger value="non-recurring-times">
          {t("nonRecurringAvailableTimes")}
        </TabsTrigger>
        <TabsTrigger value="block-dates">{t("blockedOutTimes")}</TabsTrigger>
      </TabsList>

      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <TabsContent value="overview">
          <Overview availableTimes={availableTimes} />
        </TabsContent>
        <TabsContent value="default-availability">
          <RecurringAvailabilityManager
            appointmentType={appointmentType}
            settings={availableTimes?.settings}
            recurringAvailableTimes={availableTimes?.recurringAvailableTimes}
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
  );
};

export default AvailabilityTabs;
