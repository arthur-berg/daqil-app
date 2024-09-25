import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const StepFour = ({
  form,
  onPrevStep,
}: {
  form: any;
  onPrevStep: () => void;
}) => {
  const accountType = form.watch("accountType");
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState(false);

  useEffect(() => {
    const accountType = form.getValues("accountType");

    if (accountType === "personal") {
      const isPersonalBankDetailsFilled =
        !!form.getValues("accountNumber") &&
        !!form.getValues("confirmAccountNumber") &&
        !!form.getValues("bankName");
      setIsNextButtonEnabled(isPersonalBankDetailsFilled);
    } else if (accountType === "company") {
      const isCompanyBankDetailsFilled =
        !!form.getValues("iban") &&
        !!form.getValues("swift") &&
        !!form.getValues("bankName");
      setIsNextButtonEnabled(isCompanyBankDetailsFilled);
    } else {
      setIsNextButtonEnabled(false);
    }
  }, [
    form.watch("accountType"),
    form.watch("accountNumber"),
    form.watch("confirmAccountNumber"),
    form.watch("iban"),
    form.watch("swift"),
    form.watch("bankName"),
  ]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Add Bank Account Details</h3>

      {accountType === "personal" && (
        <>
          <FormField
            control={form.control}
            name="accountSubtype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is this a checking or savings account?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="checking" id="checking" />
                      <Label htmlFor="checking">Checking Account</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="savings" id="savings" />
                      <Label htmlFor="savings">Savings Account</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankName"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your bank's full name" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  Please enter the full name of your bank.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clearingNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Clearing Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your clearing number" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  The clearing number for your bank account is usually 3-5
                  digits long.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your account number" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  Please enter your account number. This is typically found in
                  your account details.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmAccountNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Confirm Account Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Re-enter your account number"
                  />
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
            name="bankName"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Bank Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your bank's full name" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  Please enter the full name of your bank.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your IBAN" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  The International Bank Account Number (IBAN) is used to
                  identify your bank account for international transactions.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="swift"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>SWIFT/BIC Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your SWIFT/BIC code" />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  The SWIFT/BIC code is used for identifying your bank in
                  international transactions.
                </p>
              </FormItem>
            )}
          />
        </>
      )}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrevStep}>
          Back
        </Button>
        <Button type="submit" disabled={!isNextButtonEnabled}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default StepFour;
