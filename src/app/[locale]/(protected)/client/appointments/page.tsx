import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAppointments } from "@/data/appointment";
import { Link } from "@/navigation";
import {
  format,
  differenceInHours,
  isWithinInterval,
  subHours,
} from "date-fns";

const ClientAppointmentPage = async () => {
  const appointments = await getAppointments();

  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {appointments?.map((appointment: any) => {
        const startDate = new Date(appointment.startDate);
        const endDate = new Date(appointment.endDate);
        const now = new Date();
        const hoursUntilStart = differenceInHours(startDate, now);

        // Check if the user can join the waitroom (1 hour before the meeting starts)
        const canJoinWaitroom =
          now >= subHours(startDate, 1) && now < startDate;
        // Check if the user can join the meeting (between start and end time)
        const canJoinMeeting = now >= startDate && now <= endDate;

        return (
          <Card
            key={appointment._id.toString()}
            className="p-4 flex flex-col justify-between xs:w-full md:w-72"
          >
            <div>
              <CardHeader>
                <h3 className="text-xl font-semibold">{appointment.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{appointment.description}</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Start:</strong> {format(startDate, "Pp")}
                  </p>
                  <p>
                    <strong>End:</strong> {format(endDate, "Pp")}
                  </p>
                  <p>
                    <strong>Status:</strong> {appointment.status}
                  </p>
                  <p>
                    <strong>Paid:</strong> {appointment.paid ? "Yes" : "No"}
                  </p>
                </div>
                <div className="mt-2 text-gray-700">
                  {hoursUntilStart <= 24 ? (
                    <p className="font-bold text-lg">
                      Your meeting starts in{" "}
                      <span className="text-red-500">
                        {hoursUntilStart} hours
                      </span>
                    </p>
                  ) : (
                    <p className="font-bold text-lg">
                      Your meeting starts on{" "}
                      <span className="text-blue-500">
                        {format(startDate, "Pp")}
                      </span>
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-600">
                    You can join the waitroom up to 1 hour before the session
                    starts
                  </p>
                </div>
              </CardContent>
            </div>
            <div className="mt-4">
              {!canJoinWaitroom && !canJoinMeeting ? (
                <Button className="w-full" disabled={true}>
                  Join Meeting
                </Button>
              ) : (
                <Link href={`/appointments/${appointment._id}`}>
                  <Button className="w-full">Join Meeting</Button>
                </Link>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ClientAppointmentPage;
