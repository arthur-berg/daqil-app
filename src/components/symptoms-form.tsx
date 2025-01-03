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
import { SymptomsSchema } from "@/schemas";
import { saveSymptoms } from "@/actions/save-symptoms";
import { useToast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { SYMPTOM_OPTIONS } from "@/contants/config";

const SymptomsForm = ({
  treatedSymptoms,
}: {
  treatedSymptoms: string[] | null;
}) => {
  const { responseToast } = useToast();
  const tSymptoms = useTranslations("Symptoms");
  const t = useTranslations("SettingsPage");
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof SymptomsSchema>>({
    resolver: zodResolver(SymptomsSchema),
    defaultValues: {
      symptoms: treatedSymptoms ? treatedSymptoms : [],
    },
  });

  const onSubmit = (values: z.infer<typeof SymptomsSchema>) => {
    startTransition(async () => {
      const data = await saveSymptoms(values);
      responseToast(data);
    });
  };

  return (
    <Card className="sm:w-[500px] w-full shadow-lg border border-gray-200">
      <CardHeader className="text-center text-xl font-semibold">
        {t("symptomsTitle")}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  {SYMPTOM_OPTIONS.map((option) => (
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
                        {tSymptoms(`${option.value}`)}
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

export default SymptomsForm;
