"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { PaymentSettingsSchema } from "@/schemas";
import StepOne from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/step-one";
import StepTwo from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/step-two";
import StepThree from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/step-three";
import StepFour from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/step-four";
import StepFive from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/step-five";
import { useTranslations } from "next-intl";
import { saveTherapistPaymentSettings } from "@/actions/saveTherapistPaymentSettings";
import { BeatLoader } from "react-spinners";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "@/navigation";

const PaymentSettingsForm = () => {
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const router = useRouter();
  const t = useTranslations("PaymentSettingsPage");
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isNextButtonEnabled, setIsNextButtonEnabled] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: true,
  });

  const form = useForm({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: {
      country: "",
      paymentMethod: "",
      accountType: undefined,
      firstName: "",
      lastName: "",
      ownerName: "",
      ownerRole: "",
      dob: "",
      placeOfBirth: "",
      citizenship: "",
      bankName: "",
      accountSubtype: "",
      clearingNumber: "",
      accountNumber: "",
      confirmAccountNumber: "",
      iban: "",
      swift: "",
      companyRegistration: "",
    },
  });

  const onSubmit = (values: z.infer<typeof PaymentSettingsSchema>) => {
    startTransition(async () => {
      const data = await saveTherapistPaymentSettings(values);
      responseToast(data);
      if (data.success) {
        router.push(
          "/therapist/settings/payment-details-overview?newInformationSaved=true"
        );
      }
    });
  };

  const handleNextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div>
      <Progress value={(step / totalSteps) * 100} className="mb-4" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e: any) => {
            if (e.key === "Enter" && e.target.tagName === "INPUT") {
              e.preventDefault();
              if (
                (step === 1 && isNextButtonEnabled.step1) ||
                (step === 2 && isNextButtonEnabled.step2) ||
                (step === 3 && isNextButtonEnabled.step3) ||
                (step === 4 && isNextButtonEnabled.step4) ||
                (step === 5 && isNextButtonEnabled.step5)
              ) {
                handleNextStep();
              }
            }
          }}
        >
          {step === 1 && (
            <StepOne
              form={form}
              onNextStep={handleNextStep}
              t={t}
              isNextButtonEnabled={isNextButtonEnabled}
              setIsNextButtonEnabled={setIsNextButtonEnabled}
            />
          )}
          {step === 2 && (
            <StepTwo
              form={form}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              isNextButtonEnabled={isNextButtonEnabled}
              setIsNextButtonEnabled={setIsNextButtonEnabled}
              t={t}
            />
          )}
          {step === 3 && (
            <StepThree
              form={form}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              isNextButtonEnabled={isNextButtonEnabled}
              setIsNextButtonEnabled={setIsNextButtonEnabled}
              t={t}
            />
          )}
          {step === 4 && (
            <StepFour
              form={form}
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              isNextButtonEnabled={isNextButtonEnabled}
              setIsNextButtonEnabled={setIsNextButtonEnabled}
              t={t}
            />
          )}
          {step === 5 && (
            <StepFive form={form} onPrevStep={handlePrevStep} t={t} />
          )}
        </form>
      </Form>

      {isPending && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white flex flex-col items-center">
            <BeatLoader color="#ffffff" />
            {t("savingPaymentSettings")}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSettingsForm;
