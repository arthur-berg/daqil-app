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

  useEffect(() => {
    const accountType = form.getValues("accountType");

    if (accountType === "personal") {
      const accountSubtype = form.getValues("accountSubtype");
      const accountNumber = form.getValues("accountNumber");
      const confirmAccountNumber = form.getValues("confirmAccountNumber");
      const bankName = form.getValues("bankName");

      const isPersonalBankDetailsFilled =
        !!accountSubtype &&
        !!accountNumber &&
        !!confirmAccountNumber &&
        !!bankName &&
        accountNumber === confirmAccountNumber;

      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step4: isPersonalBankDetailsFilled,
      }));
    } else if (accountType === "company") {
      const isCompanyBankDetailsFilled =
        !!form.getValues("iban") &&
        !!form.getValues("swift") &&
        !!form.getValues("bankName");

      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step4: isCompanyBankDetailsFilled,
      }));
    } else {
      setIsNextButtonEnabled((prev: any) => ({
        ...prev,
        step4: false,
      }));
    }
  }, [
    form.watch("accountType"),
    form.watch("accountSubtype"),
    form.watch("accountNumber"),
    form.watch("confirmAccountNumber"),
    form.watch("iban"),
    form.watch("swift"),
    form.watch("bankName"),
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">{t("addBankAccountDetails")}</h3>

      {accountType === "personal" && (
        <>
          <FormField
            control={form.control}
            name="accountSubtype"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("accountSubtype")}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="checking" id="checking" />
                      <Label htmlFor="checking">{t("checkingAccount")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="savings" id="savings" />
                      <Label htmlFor="savings">{t("savingsAccount")}</Label>
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
                <FormLabel>{t("bankName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourBankName")} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  {t("enterBankNameHint")}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clearingNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("clearingNumber")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("enterYourClearingNumber")}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  {t("clearingNumberHint")}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("accountNumber")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourAccountNumber")} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  {t("accountNumberHint")}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmAccountNumber"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("confirmAccountNumber")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t("reEnterYourAccountNumber")}
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
                <FormLabel>{t("bankName")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourBankName")} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  {t("enterBankNameHint")}
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("iban")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourIban")} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">{t("ibanHint")}</p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="swift"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t("swiftCode")}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t("enterYourSwiftCode")} />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-600 mt-2">
                  {t("swiftCodeHint")}
                </p>
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
          disabled={!isNextButtonEnabled.step4}
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default StepFour;
