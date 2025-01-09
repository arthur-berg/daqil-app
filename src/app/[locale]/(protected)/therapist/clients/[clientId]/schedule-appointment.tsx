"use client";

import BookingCalendar from "@/app/[locale]/(protected)/(client)/book-appointment/[therapistId]/booking-calendar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";

const ScheduleAppointment = ({
  clientId,
  therapistsAvailableTimesJson,
  appointmentTypes,
  appointmentsJson,
  therapistId,
}: {
  clientId: string;
  therapistsAvailableTimesJson: string;
  appointmentTypes: any;
  appointmentsJson: string;
  therapistId: string;
}) => {
  const t = useTranslations("MyClientsPage");

  const [showCalendar, setShowCalendar] = useState(false);
  return (
    <>
      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0 mb-4">
        <Button
          className="w-full sm:w-auto"
          variant={showCalendar ? "secondary" : undefined}
          onClick={() => {
            setShowCalendar(!showCalendar);
          }}
        >
          {showCalendar ? t("exitCalendar") : t("scheduleAppointment")}
        </Button>
      </div>
      {showCalendar && (
        <BookingCalendar
          appointmentTypes={appointmentTypes}
          showOnlyIntroCalls={false}
          therapistsAvailableTimes={therapistsAvailableTimesJson}
          clientId={clientId}
          appointments={appointmentsJson}
          therapistId={therapistId}
          payLaterMode={true}
          inIntroVideoCall={false}
          smallSelect
        />
      )}
    </>
  );
};

export default ScheduleAppointment;
