"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SetupAccountSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useSearchParams } from "next/navigation";
import { setupAccount } from "@/actions/setup-account";
import { login } from "@/actions/login";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { PhoneInput } from "../ui/phone-input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { BeatLoader } from "react-spinners";

const getMappedTimezone = (ianaTimezone: string) => {
  return allTimezones[ianaTimezone] ? ianaTimezone : "Asia/Dubai";
};

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

export const SetupForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [currentPasswordRequired, setCurrentPasswordRequired] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showArabicNameFields, setShowArabicNameFields] = useState(false);
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("AuthPage");
  const { options: timezoneOptions } = useTimezoneSelect({
    timezones: allTimezones,
  });
  const [timezonePopoverOpen, setTimezonePopoverOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");

  const initialEmail =
    searchParams.get("email") || localStorage.getItem("email") || "";

  // Retrieve token from search params or localStorage
  const initialToken =
    searchParams.get("token") || localStorage.getItem("token") || "";

  const [token, setToken] = useState(initialToken);

  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  useEffect(() => {
    if (email) {
      localStorage.setItem("email", email);
    }
  }, [email]);

  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const defaultTimezone = getMappedTimezone(detectedTimezone);

  const form = useForm<z.infer<typeof SetupAccountSchema>>({
    resolver: zodResolver(SetupAccountSchema),
    defaultValues: {
      email: email ? email : "",
      currentPassword: token ? undefined : "",
      password: "",
      firstName: { en: "", ar: "" },
      lastName: { en: "", ar: "" },
      personalInfo: {
        phoneNumber: "",
        sex: undefined,
        dateOfBirth: undefined,
      },
      settings: {
        timeZone: defaultTimezone,
      },
    },
  });

  const onSubmit = (values: z.infer<typeof SetupAccountSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      const data = await setupAccount(values, locale, token);
      if ("success" in data && data.success) {
        setSuccess(data?.success);
        await login({ email: values.email, password: values.password }, locale);
      }
      if ("error" in data && data.error) {
        setError(data.error);
        if ("currentPasswordRequired" in data && data.currentPasswordRequired) {
          setCurrentPasswordRequired(true);
        }
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
      <CardWrapper
        headerLabel={t("finishSettingUpAccount")}
        backButtonLabel={t("alreadyHaveAccount")}
        backButtonHref="/auth/login"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {!token && <FormError message={""} />}
              {/* Existing Fields */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        readOnly={!!email}
                        disabled={isPending}
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("firstNameEn")}</FormLabel>{" "}
                    {/* Updated Label */}
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
                  <FormItem>
                    <FormLabel>{t("lastNameEn")}</FormLabel>{" "}
                    {/* Updated Label */}
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Toggle Arabic Name Fields */}
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

              {/* Conditional Arabic Fields */}
              {showArabicNameFields && (
                <>
                  <FormField
                    control={form.control}
                    name="firstName.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("firstNameAr")}</FormLabel>{" "}
                        {/* Arabic First Name Label */}
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
                      <FormItem>
                        <FormLabel>{t("lastNameAr")}</FormLabel>{" "}
                        {/* Arabic Last Name Label */}
                        <FormControl>
                          <Input disabled={isPending} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* New Fields for personalInfo */}
              <FormField
                control={form.control}
                name="personalInfo.phoneNumber"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel className="text-left">
                      {t("phoneNumber")}
                    </FormLabel>
                    <FormControl className="w-full">
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
                  <FormItem className="flex flex-col">
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
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("dateOfBirth")}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="YYYY/MM/DD"
                        value={field.value}
                        onChange={(e) => {
                          let input = e.target.value.replace(/[^\d/]/g, ""); // Allow digits and slashes
                          if (input.length <= 10) {
                            if (input.length >= 5 && input[4] !== "/") {
                              input = input.slice(0, 4) + "/" + input.slice(4);
                            }
                            if (input.length >= 8 && input[7] !== "/") {
                              input = input.slice(0, 7) + "/" + input.slice(7);
                            }
                          }
                          field.onChange(input); // Update the form state
                        }}
                        disabled={isPending}
                        className={cn("w-[240px]")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="settings.timeZone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("selectTimezone")}</FormLabel>
                    <Popover
                      open={timezonePopoverOpen}
                      onOpenChange={(isOpen) => setTimezonePopoverOpen(isOpen)}
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
                          <CommandList>
                            <CommandEmpty>{t("noTimezoneFound")}</CommandEmpty>
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

                          {/* Move CommandInput to the bottom */}
                          <div className="border-t p-2">
                            <CommandInput
                              placeholder={t("searchTimezone")}
                              value={timezoneSearch}
                              onValueChange={setTimezoneSearch}
                            />
                          </div>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Existing Password Fields */}
              {(!token || currentPasswordRequired) && (
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("currentPassword")}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isPending}
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Existing Error and Success Messages */}
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {t("createAccount")}
            </Button>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
