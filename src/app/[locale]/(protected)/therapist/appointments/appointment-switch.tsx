"use client";

import { useState } from "react";
import { FaCalendarAlt, FaList } from "react-icons/fa";
import AppointmentList from "./appointment-list";
import AppointmentCalendar from "./appointment-calendar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const AppointmentSwitch = ({ appointments }: { appointments: any }) => {
  const [view, setView] = useState("calendar");
  const t = useTranslations("AppointmentList");

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-center mb-4">
        <Button
          variant={view === "calendar" ? undefined : "outline"}
          onClick={() => setView("calendar")}
          className={`flex items-center mr-2 rtl:mr-0 rtl:ml-2 ${
            view === "calendar"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <FaCalendarAlt className="mr-2 rtl:mr-0 rtl:ml-2" />
          {t("calendarView")}
        </Button>
        <Button
          variant={view === "list" ? undefined : "outline"}
          onClick={() => setView("list")}
          className={`mr-2 rtl:mr-0 rtl:ml-2 flex items-center ${
            view === "list"
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          <FaList className="mr-2 rtl:ml-2 rtl:mr-0" />
          {t("listView")}
        </Button>
      </div>
      {view === "calendar" ? (
        <div className="flex justify-center">
          <AppointmentCalendar appointments={appointments} />
        </div>
      ) : (
        <div className="flex justify-center">
          {" "}
          <AppointmentList appointments={appointments} />
        </div>
      )}
    </div>
  );
};

export default AppointmentSwitch;
