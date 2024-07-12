"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const AppointmentsList = ({ appointments }: { appointments: any }) => {
  const user = useCurrentUser();

  if (!user) return;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Link href="/appointments/create">
          <Button>Create New Appointment</Button>
        </Link>
      </div>
      <div className="flex flex-wrap gap-6">
        {appointments?.map((appointment: any) => (
          <Card
            key={appointment._id.toString()}
            className="p-4 flex flex-col justify-between w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)]"
          >
            <div>
              <CardHeader>
                <h3 className="text-xl font-semibold">{appointment.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{appointment.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Start:</strong>{" "}
                    {format(new Date(appointment.startDate), "Pp")}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {format(new Date(appointment.endDate), "Pp")}
                  </p>
                  <p>
                    <strong>Status:</strong> {appointment.status}
                  </p>
                  <p>
                    <strong>Paid:</strong> {appointment.paid ? "Yes" : "No"}
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="mt-4">
              <Link href={`/appointments/${appointment._id}`}>
                <Button className="w-full">Start Meeting</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsList;
