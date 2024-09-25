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
  t,
}: {
  form: any;
  onNextStep: () => void;
  onPrevStep: () => void;
  t: any;
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

  /*   console.log("values", form.getValues()); */
  const resetFields = () => {
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
  };

  return (
    <div>
      <FormField
        control={form.control}
        name="accountType"
        render={({ field }) => (
          <FormItem className="mb-8">
            <FormLabel>{t("typeOfAccount")}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(e) => {
                  resetFields();

                  field.onChange(e);
                }}
                value={field.value}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">{t("personal")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" />
                  <Label htmlFor="company">{t("company")}</Label>
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
                <FormLabel>{t("firstName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterFirstName")} />
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
                <FormLabel>{t("lastName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterLastName")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Disclaimer Text */}
          <p className="text-sm text-gray-600 mt-4">
            {t("accountHolderDisclaimer")}
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
                <FormLabel>{t("accountOwnersName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterOwnersName")} />
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
                <FormLabel>{t("whatIsTheirRole")}</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ceo">{t("ceo")}</SelectItem>
                      <SelectItem value="owner">{t("owner")}</SelectItem>
                      <SelectItem value="director">{t("director")}</SelectItem>
                      <SelectItem value="manager">{t("manager")}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-gray-600 mt-4">
            {t("companyOwnerDisclaimer")}
          </p>
        </>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onPrevStep}>
          {t("back")}
        </Button>
        <Button
          variant="outline"
          onClick={onNextStep}
          disabled={!isNextButtonEnabled}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default StepTwo;
