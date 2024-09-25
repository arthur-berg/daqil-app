import { useEffect, useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const StepTwo = ({
  form,
  onNextStep,
  onPrevStep,
}: {
  form: any;
  onNextStep: () => void;
  onPrevStep: () => void;
}) => {
  const accountType = form.watch("accountType");

  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

  useEffect(() => {
    const accountType = form.getValues("accountType");

    if (accountType === "personal") {
      const isPersonalFieldsFilled =
        !!form.getValues("firstName") && !!form.getValues("lastName");
      setIsNextButtonEnabled(isPersonalFieldsFilled);
    } else if (accountType === "company") {
      const isCompanyFieldsFilled =
        !!form.getValues("ownerName") && !!form.getValues("ownerRole");
      setIsNextButtonEnabled(isCompanyFieldsFilled);
    } else {
      setIsNextButtonEnabled(false);
    }
  }, [
    form.watch("accountType"),
    form.watch("firstName"),
    form.watch("lastName"),
    form.watch("ownerName"),
    form.watch("ownerRole"),
  ]);

  useEffect(() => {
    form.resetField("firstName");
    form.resetField("lastName");
    form.resetField("ownerName");
    form.resetField("ownerRole");
    form.resetField("dob");
    form.resetField("placeOfBirth");
    form.resetField("citizenship");
    form.resetField("bankName");
    form.resetField("accountSubtype");
    form.resetField("clearingNumber");
    form.resetField("accountNumber");
    form.resetField("confirmAccountNumber");
    form.resetField("iban");
    form.resetField("swift");
    form.resetField("companyRegistration");
  }, [accountType, form]);

  return (
    <div>
      <FormField
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <FormItem className="mb-8">
            <FormLabel>What type of account is this?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">Company</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {accountType === "personal" && (
        <>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter first name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter last name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Disclaimer Text */}
          <p className="text-sm text-gray-600 mt-4">
            Please enter the account holder’s name exactly as it appears on your
            bank statement. If the account has multiple owners, only provide one
            name.
          </p>
        </>
      )}

      {accountType === "company" && (
        <>
          <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Owner's Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter the owner's name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ownerRole"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>What is their role?</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-gray-600 mt-4">
            Enter the name of the company or legal entity exactly as it is
            written on the account.
          </p>
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

export default StepTwo;
