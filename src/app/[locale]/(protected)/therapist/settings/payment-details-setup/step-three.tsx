import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useEffect, useState } from "react";

const StepThree = ({
  form,
  onPrevStep,
  onNextStep,
  t,
  isNextButtonEnabled,
  setIsNextButtonEnabled,
}: {
  form: any;
  onPrevStep: () => void;
  onNextStep: () => void;
  t: any;
  isNextButtonEnabled: any;
  setIsNextButtonEnabled: any;
}) => {
  const accountType = form.watch("accountType");

  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    return format(date, "yyyy/MM/dd");
  };

  const handleDateInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any
  ) => {
    let input = e.target.value.replace(/[^\d/]/g, "");
    if (input.length <= 10) {
      if (input.length >= 5 && input[4] !== "/") {
        input = input.slice(0, 4) + "/" + input.slice(4);
      }
      if (input.length >= 8 && input[7] !== "/") {
        input = input.slice(0, 7) + "/" + input.slice(7);
      }
    }
    field.onChange(input);
  };

  useEffect(() => {
    const accountType = form.getValues("accountType");

    if (accountType === "personal") {
      const isPersonalFieldsFilled =
        !!form.getValues("dob") &&
        !!form.getValues("placeOfBirth") &&
        !!form.getValues("citizenship");
      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step3: isPersonalFieldsFilled, // Update step 3's state
      }));
    } else if (accountType === "company") {
      const isCompanyFieldsFilled =
        !!form.getValues("dob") &&
        !!form.getValues("placeOfBirth") &&
        !!form.getValues("citizenship");
      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step3: isCompanyFieldsFilled, // Update step 3's state
      }));
    } else {
      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step3: false,
      }));
    }
  }, [
    form.watch("accountType"),
    form.watch("dob"),
    form.watch("placeOfBirth"),
    form.watch("citizenship"),
  ]);

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-bold mb-6">{t("kycTitle")}</h2>
      {accountType === "personal" && (
        <>
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("dateOfBirth")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="YYYY/MM/DD"
                    value={formatDateForInput(field.value)}
                    onChange={(e) => handleDateInput(e, field)}
                    className="max-w-[240px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placeOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("placeOfBirth")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourPlaceOfBirth")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="citizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("citizenship")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourCitizenship")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {accountType === "company" && (
        <>
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t("dateOfBirthRepresentative")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="YYYY/MM/DD"
                    value={formatDateForInput(field.value)}
                    onChange={(e) => handleDateInput(e, field)}
                    className="max-w-[240px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="placeOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("placeOfBirthRepresentative")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("enterRepresentativesPlaceOfBirth")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="citizenship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("citizenshipRepresentative")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("enterRepresentativesCitizenship")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyRegistration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("companyRegistrationNumber")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("enterCompanyRegistrationNumber")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrevStep}>
          {t("back")}
        </Button>
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={!isNextButtonEnabled.step3}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
