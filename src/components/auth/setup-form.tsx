"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
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

export const SetupForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [currentPasswordRequired, setCurrentPasswordRequired] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showArabicNameFields, setShowArabicNameFields] = useState(false); // New state for Arabic fields visibility
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("AuthPage");

  const email = searchParams.get("email");
  const token = searchParams.get("token");

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
    },
  });

  const onSubmit = (values: z.infer<typeof SetupAccountSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      console.log("values", values);
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

  return (
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
                  <FormLabel>{t("lastNameEn")}</FormLabel> {/* Updated Label */}
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
              variant="outline"
              onClick={() => setShowArabicNameFields(!showArabicNameFields)}
              className="mt-2"
            >
              {showArabicNameFields ? t("hideArabicName") : t("addArabicName")}
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
                  <FormLabel className="text-left">Phone Number</FormLabel>
                  <FormControl className="w-full">
                    <PhoneInput placeholder="Enter a phone number" {...field} />
                  </FormControl>
                  <FormDescription className="text-left">
                    Enter a phone number
                  </FormDescription>
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
                      className={cn("w-[240px]")}
                    />
                  </FormControl>
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
                      <Input disabled={isPending} {...field} type="password" />
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
  );
};
