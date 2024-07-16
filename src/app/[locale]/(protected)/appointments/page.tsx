import { getAppointments } from "@/actions/appointments";
import AppointmentsBody from "@/app/[locale]/(protected)/appointments/appointments-body";
import AppointmentsList from "@/app/[locale]/(protected)/appointments/appointments-list";
import { Suspense } from "react";

const AppointmentsPage = async () => {
  return (
    <div className="flex justify-center">
      <AppointmentsBody />
    </div>
  );
};

export default AppointmentsPage;
