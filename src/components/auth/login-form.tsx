"use client";

import * as z from "zod";

import { useState, useTransition } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { LoginSchema } from "@/schemas";
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
import { login } from "@/actions/login";

import { Link, useRouter } from "@/navigation";
import { useLocale } from "next-intl";

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [emailVerified, setEmailIsVerified] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const locale = useLocale();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        if (!emailVerified) {
          const data = await login(values, locale, callbackUrl, true);
          if (data?.success) {
            if (data.isAccountSetupDone) {
              setEmailIsVerified(true);
              return;
            }
            router.push(`/auth/setup?email=${values.email}`);
          }
          if (data?.error) {
            setEmailIsVerified(false);
          }
          return;
        }
        const data = await login(values, locale, callbackUrl);
        if (data?.error) {
          setError(data.error);
        }

        if (data?.success) {
          form.reset();
          setSuccess(data.success as string);
        }
        if (data?.twoFactor) {
          setShowTwoFactor(true);
        }
      } catch {
        setError("Something went wrong!");
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && !emailVerified && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
              </>
            )}
            {!showTwoFactor && emailVerified && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          inputSize="lg"
                          disabled={isPending}
                          {...field}
                          type="password"
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <Button
              size="sm"
              variant="link"
              asChild
              className="px-0 font-normal text-xs"
            >
              <Link href="/auth/reset">Forgot password?</Link>
            </Button>
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {showTwoFactor
              ? "Confirm"
              : !showTwoFactor && !emailVerified
              ? "Continue"
              : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
