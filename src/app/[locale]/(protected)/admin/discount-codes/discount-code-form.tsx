"use client";
import * as z from "zod";
import { useState, useTransition } from "react";
import { DiscountCodeSchema } from "@/schemas";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/datetime-picker";
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

const DiscountCodeForm = () => {
  const [isPending, startTransition] = useTransition();
  const [limitPerUser, setLimitPerUser] = useState(false);
  const [setTimePeriod, setSetTimePeriod] = useState(false);

  const { responseToast } = useToast();

  const t = useTranslations("AdminPage");

  const form = useForm<z.infer<typeof DiscountCodeSchema>>({
    resolver: zodResolver(DiscountCodeSchema),
    defaultValues: {
      code: "",
      percentage: 0,
      firstTimeUserOnly: false,
      limitPerUser: 1,
      startDate: null,
      endDate: null,
    },
  });

  const onSubmit = (values: z.infer<typeof DiscountCodeSchema>) => {
    startTransition(async () => {
      // const data = await createDiscountCode(values);
      // responseToast(data);
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <p>🎟️ {t("manageDiscountCodes")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("codeLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
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
                      <Input type="number" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstTimeUserOnly"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormLabel>{t("firstTimeUserOnlyLabel")}</FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limitPerUser"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start space-x-2">
                    <div className="flex">
                      <FormLabel>{t("limitPerUserLabel")}</FormLabel>
                      <FormControl>
                        <input
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
                      <div className="inline-flex">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            min={1}
                            disabled={isPending}
                          />
                        </FormControl>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem className="flex items-center space-x-2">
                <FormLabel>{t("setTimePeriodLabel")}</FormLabel>
                <FormControl>
                  <input
                    type="checkbox"
                    checked={setTimePeriod}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSetTimePeriod(isChecked);
                      if (!isChecked) {
                        form.setValue("startDate", null);
                        form.setValue("endDate", null);
                      }
                    }}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
              {setTimePeriod && (
                <>
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("startDateLabel")}</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            granularity="hour"
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
                        <FormLabel>{t("endDateLabel")}</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            granularity="hour"
                            showClearButton={false}
                            jsDate={field.value}
                            onJsDateChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <Button type="submit">{t("createDiscountCode")}</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountCodeForm;
