"use client";
import { useState, useEffect } from "react";
import { getAppointments } from "@/data/appointment";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Adjust import paths based on your project structure
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/auth";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AppointmentList = ({ appointments }: { appointments: any }) => {
  const [filter, setFilter] = useState("confirmed");

  const filteredAppointments = appointments?.filter(
    (appointment: any) => appointment.status === filter
  );

  return (
    <Card className="md:w-8/12">
      <CardContent>
        <div className="flex justify-center py-8">
          <div className="space-y-8 w-full max-w-4xl">
            <div className="flex justify-center mb-6">
              <div className="flex justify-center items-center mb-6 flex-col md:flex-row">
                <div className="mr-4">Appointment Status: </div>
                <Select
                  defaultValue="confirmed"
                  onValueChange={(value) => setFilter(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {filteredAppointments?.map((appointment: any) => (
                <AccordionItem
                  className="bg-white"
                  key={appointment._id.toString()}
                  value={appointment._id.toString()}
                >
                  <AccordionTrigger className="flex justify-between p-4 bg-gray-100 rounded">
                    <span>
                      {format(new Date(appointment.startDate), "Pp")} -{" "}
                      {appointment.title}
                    </span>
                    <span>
                      {appointment.hostUserId.firstName}{" "}
                      {appointment.hostUserId.lastName}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 border-t border-gray-200">
                    <div>
                      <p className="text-gray-600 mb-4">
                        {appointment.description}
                      </p>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          <strong>Start:</strong>{" "}
                          {format(new Date(appointment.startDate), "Pp")}
                        </p>
                        <p>
                          <strong>Duration:</strong>{" "}
                          {appointment.durationInMinutes} minutes
                        </p>
                        <p>
                          <strong>Status:</strong> {appointment.status}
                        </p>
                        <p>
                          <strong>Paid:</strong>{" "}
                          {appointment.paid ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-md font-semibold">Host:</h4>
                        <p className="text-sm text-gray-500">
                          {appointment.hostUserId.firstName}{" "}
                          {appointment.hostUserId.lastName} (
                          {appointment.hostUserId.email})
                        </p>
                      </div>
                      <div className="mt-6 flex justify-center">
                        <Link href={`/appointments/${appointment._id}`}>
                          <Button>Join Meeting</Button>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentList;
