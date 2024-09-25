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
}: {
  form: any;
  onPrevStep: () => void;
  onNextStep: () => void;
}) => {
  const accountType = form.watch("accountType");
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

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
      setIsNextButtonEnabled(isPersonalFieldsFilled);
    } else if (accountType === "company") {
      const isCompanyFieldsFilled =
        !!form.getValues("dob") &&
        !!form.getValues("placeOfBirth") &&
        !!form.getValues("citizenship");
      setIsNextButtonEnabled(isCompanyFieldsFilled);
    } else {
      setIsNextButtonEnabled(false);
    }
  }, [
    form.watch("accountType"),
    form.watch("dob"),
    form.watch("placeOfBirth"),
    form.watch("citizenship"),
  ]);

  return (
    <div className="space-y-4 mt-8">
      {accountType === "personal" && (
        <>
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
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
                <FormLabel>Place of Birth</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your place of birth" />
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
                <FormLabel>Citizenship</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your citizenship" />
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
                <FormLabel>Date of Birth (Representative)</FormLabel>
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
                <FormLabel>Place of Birth (Representative)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter the representative's place of birth"
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
                <FormLabel>Citizenship (Representative)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter the representative's citizenship"
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
                <FormLabel>Company Registration Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter company registration number"
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
          Back
        </Button>
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={!isNextButtonEnabled}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default StepThree;
