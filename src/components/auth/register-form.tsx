"use client";

import * as z from "zod";

import { useEffect, useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RegisterSchema } from "@/schemas";
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
import { register } from "@/actions/register";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

export const RegisterForm = ({
  searchParams: { utm_source, utm_medium, utm_campaign, utm_term, utm_content },
}: {
  searchParams: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("RegisterPage");
  /* const searchParams = useSearchParams(); */

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (utm_source || utm_medium || utm_campaign || utm_term || utm_content) {
      if (utm_source)
        Cookies.set("utm_source", utm_source, { expires: 30, path: "/" });
      if (utm_medium)
        Cookies.set("utm_medium", utm_medium, { expires: 30, path: "/" });
      if (utm_campaign)
        Cookies.set("utm_campaign", utm_campaign, { expires: 30, path: "/" });
      if (utm_term)
        Cookies.set("utm_term", utm_term, { expires: 30, path: "/" });
      if (utm_content)
        Cookies.set("utm_content", utm_content, { expires: 30, path: "/" });
    }
  }, [utm_source, utm_medium, utm_campaign, utm_term, utm_content]);

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");
    // Check for UTM cookies
    const utmSource = Cookies.get("utm_source");
    const utmMedium = Cookies.get("utm_medium");
    const utmCampaign = Cookies.get("utm_campaign");
    const utmTerm = Cookies.get("utm_term");
    const utmContent = Cookies.get("utm_content");

    // If any UTM cookies exist, add them to the values object
    const utmData = {
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmTerm: utmTerm || null,
      utmContent: utmContent || null,
    };

    // Merge UTM data with the registration values
    const registrationData = { ...values, ...utmData };

    startTransition(async () => {
      const data = await register(registrationData);
      setError(data.error);
      setSuccess(data.success);
    });
  };

  return (
    <CardWrapper
      headerLabel={!success ? t("createAccount") : ""}
      backButtonLabel={t("alreadyHaveAccount")}
      backButtonHref="/auth/login"
      showSocial
    >
      {!success && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        inputSize="lg"
                        disabled={isPending}
                        {...field}
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />

            <Button type="submit" className="w-full" disabled={isPending}>
              {t("createAccount")}
            </Button>
          </form>
        </Form>
      )}

      {success && (
        <div className="bg-success/15 p-3 rounded-md text-lg text-success text-center">
          <p>{success}</p>
        </div>
      )}
    </CardWrapper>
  );
};
