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
import { Separator } from "@/components/ui/separator";

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
        {/* English Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">{t("englishSection")}</h2>

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
                  <Textarea
                    {...field}
                    disabled={isPending}
                    className="h-64"
                    placeholder={t("workDescriptionPlaceholderEn")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Separator className="my-6" /> {/* Divider between sections */}
        {/* Arabic Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">{t("arabicSection")}</h2>

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
                  <Textarea
                    {...field}
                    disabled={isPending}
                    className="h-64"
                    placeholder={t("workDescriptionPlaceholderAr")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Form Actions */}
        <div className="flex flex-col-reverse md:flex-row justify-end space-y-4 md:space-y-0 md:space-x-4">
          <Button type="submit" disabled={isPending}>
            {t("save")}
          </Button>
          <Button
            onClick={handleCancel}
            variant="secondary"
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MyProfileForm;
