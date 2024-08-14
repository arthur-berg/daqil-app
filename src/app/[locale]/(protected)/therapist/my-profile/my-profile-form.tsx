"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { TherapistMyProfileSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormControl,
  FormLabel,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { updateTherapistProfile } from "@/actions/therapist-profile";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";

const MyProfileForm = ({
  therapist,
  setIsEditing,
}: {
  therapist: any;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const form = useForm<z.infer<typeof TherapistMyProfileSchema>>({
    resolver: zodResolver(TherapistMyProfileSchema),
    defaultValues: {
      workTitleEn: therapist?.therapistWorkProfile?.en?.title || "",
      workDescriptionEn: therapist?.therapistWorkProfile?.en?.description || "",
      workTitleAr: therapist?.therapistWorkProfile?.ar?.title || "",
      workDescriptionAr: therapist?.therapistWorkProfile?.ar?.description || "",
    },
  });

  const t = useTranslations("TherapistProfilePage");

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
  };

  const onSubmit = (values: z.infer<typeof TherapistMyProfileSchema>) => {
    startTransition(async () => {
      const data = await updateTherapistProfile(values);
      responseToast(data);
      if (data.success) {
        setIsEditing(false);
        form.reset();
      }
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-8 w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("englishSection")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="workTitleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workTitleLabelEn")}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workDescriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workDescriptionLabelEn")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t("arabicSection")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="workTitleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workTitleLabelAr")}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workDescriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workDescriptionLabelAr")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
          <Button type="submit" disabled={isPending}>
            Save
          </Button>
          <Button
            onClick={handleCancel}
            variant="secondary"
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MyProfileForm;
