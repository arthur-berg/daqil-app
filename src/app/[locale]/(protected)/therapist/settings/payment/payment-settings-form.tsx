"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { PaymentSettingsSchema } from "@/schemas";
import StepOne from "@/app/[locale]/(protected)/therapist/settings/payment/step-one";
import StepTwo from "@/app/[locale]/(protected)/therapist/settings/payment/step-two";
import StepThree from "@/app/[locale]/(protected)/therapist/settings/payment/step-three";

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
  const totalSteps = 3;

  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    // Handle form submission
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevStep = (e) => {
    e.preventDefault();
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md">
      <Progress value={(step / totalSteps) * 100} className="mb-4" />

      <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
        <form>
          {step === 1 && <StepOne form={form} />}
          {step === 2 && <StepTwo form={form} />}
          {step === 3 && <StepThree form={form} />}

          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
            )}
            {step < totalSteps && (
              <Button variant="outline" onClick={handleNextStep}>
                Continue
              </Button>
            )}
            {step === totalSteps && <Button type="submit">Submit</Button>}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentSettingsForm;
