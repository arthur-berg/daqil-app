"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { InviteTherapistSchema } from "@/schemas";
import { inviteTherapist } from "@/actions/admin";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const InviteTherapistForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const tError = useTranslations("ErrorMessages");
  const { toast } = useToast();
  const form = useForm<z.infer<typeof InviteTherapistSchema>>({
    resolver: zodResolver(InviteTherapistSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof InviteTherapistSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const data = await inviteTherapist(values);

        if (data?.error) {
          setError(data.error);
          toast({
            title: data.error,
            variant: "destructive",
            status: "destructive",
          });
        }

        if (data?.success) {
          setSuccess(data.success as string);
          toast({
            title: data.success,
            variant: "success",
            status: "success",
          });
          form.reset();
        }
      } catch {
        setError(tError("somethingWentWrong"));
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1>Invite therapists</h1>

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
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit" className="w-full" disabled={isPending}>
          Send invite
        </Button>
      </form>
    </Form>
  );
};

export default InviteTherapistForm;
