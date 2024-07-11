"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { AppointmentSchema } from "@/schemas";
import { useTransition, useState } from "react";

import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAppointment } from "@/actions/appointments";
import { useToast } from "@/components/ui/use-toast";

import { DateTimePicker } from "@/components/ui/datetime-picker";
import { ToastAction } from "@/components/ui/toast";
import { Link, useRouter } from "@/navigation";

const CreateAppointmentForm = ({ patients }: { patients: any }) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      title: "",
      description: "",
      paid: false,
      status: "confirmed",
      patientId: "",
    },
  });

  const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
    startTransition(async () => {
      try {
        const data = await createAppointment(values);
        if (data.error) {
          setError(data.error);
        }
        if (data.success) {
          setError(undefined);
          setSuccess(data.success);
          toast({
            title: data.success,
          });
          router.push("/appointments");
        }
      } catch {
        setError("Something went wrong!");
      }
    });
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <p className="text-2xl font-semibold text-center">Create Appointment</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient: any) => (
                          <SelectItem key={patient._id} value={patient._id}>
                            {patient.firstName} {patient.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        granularity="second"
                        showClearButton={false}
                        jsDate={field.value}
                        onJsDateChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        granularity="second"
                        showClearButton={true}
                        jsDate={field.value}
                        onJsDateChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between">
                    <FormLabel>Paid</FormLabel>
                    <FormControl>
                      <Switch
                        disabled={isPending}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        name={field.name}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder="Select status"
                            ref={field.ref}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button disabled={isPending} type="submit">
              Create
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateAppointmentForm;
