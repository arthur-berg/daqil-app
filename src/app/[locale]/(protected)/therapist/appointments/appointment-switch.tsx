"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaList } from "react-icons/fa";
import AppointmentList from "./appointment-list";
import AppointmentCalendar from "./appointment-calendar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const AppointmentSwitch = ({ appointmentsJson }: { appointmentsJson: any }) => {
  const [view, setView] = useState<any>(null);
  const t = useTranslations("AppointmentList");
  const appointments = JSON.parse(appointmentsJson);

  // Load the preferred view from cookies when the component mounts
  useEffect(() => {
    const savedView = Cookies.get("preferredView");
    if (savedView) {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: string) => {
    setView(newView);
    Cookies.set("preferredView", newView, { expires: 365 }); // Set cookie to expire in 1 year
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-center mb-4">
        <Button
          disabled={!view}
          variant={view === "calendar" ? undefined : "outline"}
          onClick={() => handleViewChange("calendar")}
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
          disabled={!view}
          variant={view === "list" ? undefined : "outline"}
          onClick={() => handleViewChange("list")}
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
