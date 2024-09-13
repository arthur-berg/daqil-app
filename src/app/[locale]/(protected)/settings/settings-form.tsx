"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { SettingsSchema } from "@/schemas";
import { useTransition, useState } from "react";
import { useSession } from "next-auth/react";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";

import { Switch } from "@/components/ui/switch";

import { settings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentUser } from "@/hooks/use-current-user";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useTranslations } from "next-intl";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { CaretSortIcon } from "@radix-ui/react-icons";
import PageTitle from "@/components/page-title";

const getGmtOffset = (timezone: string) => {
  const now = new Date();
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  });

  const [{ value: timeZoneName }] = dtf
    .formatToParts(now)
    .filter(({ type }) => type === "timeZoneName");

  return `${timeZoneName}`;
};

const SettingsForm = () => {
  const user = useCurrentUser();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const { update } = useSession();
  const t = useTranslations("SettingsPage");
  const { options: timezoneOptions, parseTimezone } = useTimezoneSelect({
    timezones: allTimezones,
  });
  const [timezonePopoverOpen, setTimezonePopoverOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  const form = useForm<z.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      email: user?.email || undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      settings: {
        timeZone:
          user?.settings?.timeZone ||
          Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  });

  const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
    startTransition(async () => {
      try {
        const data = await settings(values);
        if (data.error) {
          setError(data.error);
        }
        if (data.success) {
          update();
          setError(undefined);
          setSuccess(data.success);
        }
      } catch {
        setError("Something went wrong!");
      }
    });
  };

  return (
    <>
      <div className="sm:w-[500px] w-full mx-auto">
        <PageTitle title={t("settings")} />
        <h1 className="text-3xl font-bold text-center text-primary flex-grow"></h1>
      </div>
      <div className="flex justify-center">
        <Card className="sm:w-[500px] w-full">
          <CardHeader></CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="space-y-4">
                  {user?.isOAuth === false && (
                    <>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("emailLabel")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                type="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("currentPasswordLabel")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                type="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("newPasswordLabel")}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isPending}
                                type="password"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="settings.timeZone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block">
                          {t("timezoneLabel")}
                        </FormLabel>
                        <Popover
                          open={timezonePopoverOpen}
                          onOpenChange={(isOpen) =>
                            setTimezonePopoverOpen(isOpen)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="justify-between w-[300px] sm:w-full"
                            >
                              <div className="truncate max-w-[calc(100%-24px)]">
                                {field.value && allTimezones[field.value]
                                  ? `${getGmtOffset(field.value)} ${
                                      allTimezones[field.value]
                                    }`
                                  : t("selectTimezone")}
                              </div>
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[280px] p-0">
                            <Command>
                              <CommandInput
                                placeholder={t("searchTimezone")}
                                value={timezoneSearch}
                                onValueChange={setTimezoneSearch}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {t("noTimezoneFound")}
                                </CommandEmpty>
                                <CommandGroup>
                                  {timezoneOptions
                                    .filter((option) =>
                                      option.label
                                        .toLowerCase()
                                        .includes(timezoneSearch.toLowerCase())
                                    )
                                    .map((option) => (
                                      <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                          const parsedTimezone = parseTimezone(
                                            option.value
                                          ).value;
                                          field.onChange(parsedTimezone);
                                          setTimezonePopoverOpen(false);
                                        }}
                                      >
                                        {option.label}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* {user?.isOAuth === false && (
                <FormField
                  control={form.control}
                  name="isTwoFactorEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>{t("twoFactorAuthLabel")}</FormLabel>
                        <FormDescription>{t("twoFactorText")}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          disabled={isPending}
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )} */}
                </div>
                <FormError message={error} />
                <FormSuccess message={success} />
                <Button disabled={isPending} type="submit">
                  {t("saveBtn")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SettingsForm;
