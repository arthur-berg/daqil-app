"use client";
import { format } from "date-fns";

const NextAppointment = ({
  nextAvailableSlot,
  nextAvailable,
}: {
  nextAvailableSlot: any;
  nextAvailable: any;
}) => {
  return (
    <div className="bg-blue-100 text-blue-800 font-semibold text-sm px-3 py-1 rounded-full mb-2 text-center">
      {nextAvailable}{" "}
      {format(new Date(nextAvailableSlot), "eeee, MMMM d, HH:mm")}
    </div>
  );
};

export default NextAppointment;
