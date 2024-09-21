"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OAuthAccountSetupSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTimezoneSelect, allTimezones } from "react-timezone-select";
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
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { PhoneInput } from "@/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { BeatLoader } from "react-spinners";
import { useTranslations } from "next-intl";
import { setupOAuthAccount } from "@/actions/setup-oauth-account";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "@/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useGetCountries } from "@/hooks/use-get-countries";

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

const OAuthAccountSetupForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [showArabicNameFields, setShowArabicNameFields] = useState(false);
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countries = useGetCountries();

  const router = useRouter();
  const user = useCurrentUser();
  const t = useTranslations("AuthPage");
  const { responseToast } = useToast();

  const { options: timezoneOptions } = useTimezoneSelect({
    timezones: allTimezones,
  });
  const [timezonePopoverOpen, setTimezonePopoverOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultTimezone = allTimezones[detectedTimezone]
    ? detectedTimezone
    : "Asia/Dubai";

  const form = useForm<z.infer<typeof OAuthAccountSetupSchema>>({
    resolver: zodResolver(OAuthAccountSetupSchema),
    defaultValues: {
      firstName: {
        en: user?.firstName?.en || "",
        ar: user?.firstName?.ar || "",
      },
      lastName: { en: user?.lastName?.en || "", ar: user?.lastName?.ar || "" },
      personalInfo: {
        phoneNumber: user?.personalInfo?.phoneNumber || "",
        sex: user?.personalInfo?.sex || undefined,
        dateOfBirth: undefined,
        country: undefined,
      },
      settings: {
        timeZone: defaultTimezone,
      },
    },
  });

  if (!user) return "User not found";

  const onSubmit = (values: z.infer<typeof OAuthAccountSetupSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const data = await setupOAuthAccount(values, user.id);
      responseToast(data);
      if ("success" in data && data.success) {
        setSuccess(data.success);
        form.reset();
        router.push("/book-appointment");
      } else if ("error" in data && data.error) {
        setError(data.error);
      }
    });
  };

  return isPending ? (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <BeatLoader color="white" />
      <div className="text-lg font-medium text-white">
        {t("settingUpAccount")}
      </div>
    </div>
  ) : (
    <div className="py-4 container flex justify-center">
      <Card className="w-full sm:w-[500px] mx-auto">
        <CardHeader>{t("finishSettingUpAccount")}</CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                {/* First Name (English) */}
                <FormField
                  control={form.control}
                  name="firstName.en"
                  render={({ field }) => (
                    <FormItem className="max-w-[280px]">
                      <FormLabel>{t("firstNameEn")}</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName.en"
                  render={({ field }) => (
                    <FormItem className="max-w-[280px]">
                      <FormLabel>{t("lastNameEn")}</FormLabel>
                      <FormControl>
                        <Input disabled={isPending} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant={showArabicNameFields ? "destructive" : "outline"}
                  onClick={() => setShowArabicNameFields(!showArabicNameFields)}
                  className="mt-2"
                >
                  {showArabicNameFields
                    ? t("hideArabicName")
                    : t("addArabicName")}
                </Button>

                {showArabicNameFields && (
                  <>
                    <FormField
                      control={form.control}
                      name="firstName.ar"
                      render={({ field }) => (
                        <FormItem className="max-w-[280px]">
                          <FormLabel>{t("firstNameAr")}</FormLabel>
                          <FormControl>
                            <Input disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName.ar"
                      render={({ field }) => (
                        <FormItem className="max-w-[280px]">
                          <FormLabel>{t("lastNameAr")}</FormLabel>
                          <FormControl>
                            <Input disabled={isPending} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="personalInfo.phoneNumber"
                  render={({ field }) => (
                    <FormItem className="max-w-[280px]">
                      <FormLabel>{t("phoneNumber")}</FormLabel>
                      <FormControl>
                        <PhoneInput
                          placeholder={t("phoneNumberPlaceholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalInfo.sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("sex")}</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MALE" id="male" />
                            <Label htmlFor="male">{t("male")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FEMALE" id="female" />
                            <Label htmlFor="female">{t("female")}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OTHER" id="other" />
                            <Label htmlFor="other">{t("other")}</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalInfo.dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("dateOfBirth")}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="YYYY/MM/DD"
                          value={field.value}
                          onChange={(e) => {
                            let input = e.target.value.replace(/\D/g, "");
                            if (input.length > 8) input = input.slice(0, 8);
                            if (input.length >= 4) {
                              input = input.slice(0, 4) + "/" + input.slice(4);
                            }
                            if (input.length >= 7) {
                              input = input.slice(0, 7) + "/" + input.slice(7);
                            }
                            field.onChange(input);
                          }}
                          disabled={isPending}
                          className={cn("max-w-[280px]")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="personalInfo.country"
                  render={({ field }) => (
                    <FormItem className="flex flex-col max-w-[280px]">
                      <FormLabel>{t("selectCountry")}</FormLabel>
                      <Popover
                        open={countryPopoverOpen}
                        onOpenChange={(isOpen) => setCountryPopoverOpen(isOpen)}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="justify-between sm:w-full"
                          >
                            <div className="truncate max-w-[calc(100%-24px)]">
                              {field.value
                                ? countries.find(
                                    (c: any) => c.value === field.value
                                  )?.label
                                : t("selectCountry")}
                            </div>
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-0">
                          <Command>
                            <CommandList>
                              <CommandEmpty>{t("noCountryFound")}</CommandEmpty>
                              <CommandGroup>
                                {countries
                                  .filter((country: any) =>
                                    country.label
                                      .toLowerCase()
                                      .includes(countrySearch.toLowerCase())
                                  )
                                  .map((country: any) => (
                                    <CommandItem
                                      key={country.value}
                                      onSelect={() => {
                                        field.onChange(country.value);
                                        setCountryPopoverOpen(false);
                                      }}
                                    >
                                      {country.label}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                            <div className="border-t p-2">
                              <CommandInput
                                placeholder={t("searchCountry")}
                                value={countrySearch}
                                onValueChange={setCountrySearch}
                              />
                            </div>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.timeZone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t("selectTimezone")}</FormLabel>
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
                            className="justify-between sm:w-full"
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
                                        field.onChange(option.value);
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
              </div>

              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}

              <Button type="submit" className="w-full" disabled={isPending}>
                {t("finishAccountSetup")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthAccountSetupForm;
