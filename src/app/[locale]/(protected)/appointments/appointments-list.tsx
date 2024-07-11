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
    <div className="space-y-4">
      <Link href="/appointments/create">
        <Button className="mb-4">Create new appointment</Button>
      </Link>
      {appointments?.map((appointment: any) => (
        <Card
          key={appointment._id.toString()}
          className="flex flex-row space-x-4 p-4"
        >
          <div className="flex-grow">
            <CardHeader>
              <h3 className="text-xl font-semibold">{appointment.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{appointment.description}</p>
              <div className="mt-2 text-sm text-gray-500">
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
              <Link href={`/appointments/${appointment._id}`}>
                <Button>Start meeting</Button>
              </Link>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;
