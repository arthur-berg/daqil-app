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

export const SetupForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [currentPasswordRequired, setCurrentPasswordRequired] = useState(false);
  const [isPending, startTransition] = useTransition();
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
      firstName: "",
      lastName: "",
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
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
