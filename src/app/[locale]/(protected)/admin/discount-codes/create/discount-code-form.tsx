"use client";
import * as z from "zod";
import { useState, useTransition } from "react";
import { DiscountCodeSchema } from "@/schemas";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { createDiscountCode } from "@/actions/admin";
import { useRouter } from "@/navigation";
import { DateTimePicker } from "@/components/ui/datetime-picker";

const DiscountCodeForm = () => {
  const [isPending, startTransition] = useTransition();
  const [limitPerUser, setLimitPerUser] = useState(false);
  const [setTimePeriod, setSetTimePeriod] = useState(false);
  const router = useRouter();

  const { responseToast } = useToast();

  const t = useTranslations("AdminPage");

  const form = useForm<z.infer<typeof DiscountCodeSchema>>({
    resolver: zodResolver(DiscountCodeSchema),
    defaultValues: {
      code: "",
      percentage: null, // Set to null by default
      firstTimeUserOnly: false,
      limitPerUser: null,
      startDate: undefined,
      endDate: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof DiscountCodeSchema>) => {
    startTransition(async () => {
      const data = await createDiscountCode(values);
      responseToast(data);
      if (data.success) {
        form.reset();
        router.push("/admin/discount-codes");
      }
    });
  };

  return (
    <div className="sm:max-w-4xl mx-auto py-8 sm:px-4 w-full">
      <Card>
        <CardHeader>
          <p className="text-xl text-center">🎟️ {t("createDiscountCode")}</p>
        </CardHeader>
        <CardContent className="space-y-4 flex justify-center">
          <Form {...form}>
            <form
              className="space-y-6 inline-flex flex-col"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("codeLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("percentageLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""} // Convert null to an empty string
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : Number(value));
                        }}
                        disabled={isPending}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstTimeUserOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center">
                      <FormLabel>{t("firstTimeUserOnlyLabel")}</FormLabel>
                      <FormControl>
                        <input
                          className="ml-2"
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={isPending}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limitPerUser"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start space-y-2 ">
                    <div className="flex items-center mb-2">
                      <FormLabel>{t("limitPerUserLabel")}</FormLabel>
                      <FormControl>
                        <input
                          className="ml-2"
                          type="checkbox"
                          checked={limitPerUser}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setLimitPerUser(isChecked);
                            if (!isChecked) {
                              field.onChange(1); // Reset to default if unchecked
                            }
                          }}
                          disabled={isPending}
                        />
                      </FormControl>
                    </div>
                    {limitPerUser && (
                      <div>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : Number(value)
                              );
                            }}
                            value={field.value === null ? "" : field.value}
                            min={1}
                            disabled={isPending}
                            className="w-full"
                          />
                        </FormControl>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center">
                  <FormLabel>{t("setTimePeriodLabel")}</FormLabel>
                  <FormControl>
                    <input
                      className="ml-2"
                      type="checkbox"
                      checked={setTimePeriod}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSetTimePeriod(isChecked);
                        if (!isChecked) {
                          form.setValue("startDate", undefined);
                          form.setValue("endDate", undefined);
                        }
                      }}
                      disabled={isPending}
                    />
                  </FormControl>
                </div>
              </FormItem>
              {setTimePeriod && (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("startDateLabel")}</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("endDateLabel")}</FormLabel>
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
                </div>
              )}
              <div className="flex justify-center">
                <Button type="submit" className="w-full sm:w-auto mt-4">
                  {t("createDiscountCode")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCodeForm;
