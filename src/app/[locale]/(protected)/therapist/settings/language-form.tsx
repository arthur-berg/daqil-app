"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LanguagesSchema } from "@/schemas";
import { saveLanguages, saveSymptoms } from "@/actions/save-symptoms";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { LANGUAGE_OPTIONS } from "@/contants/config";

const LanguageForm = ({ languages }: { languages: string[] | null }) => {
  const { responseToast } = useToast();
  const tLanguages = useTranslations("Languages");
  const t = useTranslations("SettingsPage");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof LanguagesSchema>>({
    resolver: zodResolver(LanguagesSchema),
    defaultValues: {
      languages: languages ? languages : [],
    },
  });

  const onSubmit = (values: z.infer<typeof LanguagesSchema>) => {
    startTransition(async () => {
      const data = await saveLanguages(values);
      responseToast(data);
    });
  };

  return (
    <Card className="sm:w-[500px] w-full shadow-lg border border-gray-200">
      <CardHeader className="text-center text-xl font-semibold">
        {t("languageTitle")}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const value = option.value;
                            field.onChange(
                              checked
                                ? [...field.value, value]
                                : field.value.filter(
                                    (symptom) => symptom !== value
                                  )
                            );
                          }}
                          id={option.value}
                        />
                      </FormControl>
                      <FormLabel htmlFor={option.value}>
                        {tLanguages(`${option.value}`)}
                      </FormLabel>
                    </div>
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {t("saveBtn")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LanguageForm;
