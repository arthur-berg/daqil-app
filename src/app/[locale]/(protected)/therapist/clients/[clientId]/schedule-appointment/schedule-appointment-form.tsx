"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { AppointmentSchema } from "@/schemas";
import { useTransition, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useToast } from "@/components/ui/use-toast";
import { Link, useRouter } from "@/navigation";
import { useTranslations } from "next-intl";
import { scheduleAppointment } from "@/actions/appointments/schedule-appointment";
import { useUserName } from "@/hooks/use-user-name";
import { DateTimePicker } from "@/components/ui/datetime-picker";

const ScheduleAppointmentForm = ({
  clientJson,
  appointmentType,
}: {
  clientJson: any;
  appointmentType: any;
}) => {
  const client = JSON.parse(clientJson);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const user = useCurrentUser();
  const router = useRouter();
  const { firstName, getFullName } = useUserName();
  const t = useTranslations("ScheduleAppointmentPage");

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      startDate: undefined,
      title:
        user?.role === "THERAPIST" ? `Therapy session with ${firstName}` : "",
      description: "",
      paid: false,
      status: "confirmed",
      clientId: client._id.toString(),
      appointmentTypeId: appointmentType._id,
    },
  });

  const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
    startTransition(async () => {
      try {
        const data = await scheduleAppointment(values);

        responseToast(data);

        if (data.error) {
          setError(data.error);
        }
        if (data.success) {
          setError(undefined);
          form.reset();

          router.push(`/therapist/clients/${values.clientId}`);
        }
      } catch {
        setError("Something went wrong!");
      }
    });
  };

  return (
    <div className="flex justify-center">
      <Card className="md:w-[600px] border-none shadow-none">
        <CardHeader>
          <p className="text-2xl font-semibold text-center">
            {t("scheduleAppointmentWith")}{" "}
            {getFullName(client.firstName, client.lastName)}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("startDate")}</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          granularity="minute"
                          hourCycle={24}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p className="font-semibold text-lg">{t("cost")}</p>
                  <p className="text-gray-700">
                    {`${appointmentType?.price} ${appointmentType?.currency}`}
                  </p>
                </div>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <p className="font-semibold text-lg">{t("duration")}</p>
                  <p className="text-gray-700">
                    {appointmentType.durationInMinutes} {t("minutes")}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("title")}{" "}
                        <span className="text-xs italic">
                          ({t("willBeShownPatientCalendar")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("description")}{" "}
                        <span className="text-xs italic">
                          ({t("willNotBeShownPatientCalendar")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button disabled={isPending} type="submit">
                Schedule
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleAppointmentForm;
