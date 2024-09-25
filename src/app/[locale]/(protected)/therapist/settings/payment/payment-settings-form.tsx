"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { PaymentSettingsSchema } from "@/schemas";
import StepOne from "@/app/[locale]/(protected)/therapist/settings/payment/step-one";
import StepTwo from "@/app/[locale]/(protected)/therapist/settings/payment/step-two";
import StepThree from "@/app/[locale]/(protected)/therapist/settings/payment/step-three";
import StepFour from "@/app/[locale]/(protected)/therapist/settings/payment/step-four";

const PaymentSettingsForm = () => {
  const form = useForm({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: {
      country: "",
      paymentMethod: "",
      accountType: "",
    },
  });

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    // Handle form submission
  };

  const handleNextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md">
      <Progress value={(step / totalSteps) * 100} className="mb-4" />

      <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
        <form>
          {step === 1 && <StepOne form={form} onNextStep={handleNextStep} />}
          {step === 2 && (
            <StepTwo
              form={form}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          )}
          {step === 3 && (
            <StepThree
              form={form}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          )}
          {step === 4 && <StepFour form={form} onPrevStep={handlePrevStep} />}
        </form>
      </Form>
    </div>
  );
};

export default PaymentSettingsForm;
