"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
const questions = [
  { id: 1, question: "What is your name?", name: "name" },
  { id: 2, question: "What is your email?", name: "email" },
  { id: 3, question: "What is your phone number?", name: "phone" },
  // Add more questions as needed
];

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { control, handleSubmit, setValue, getValues } = useForm();

  // Load saved answers from localStorage
  useEffect(() => {
    const savedAnswers =
      JSON.parse(localStorage.getItem("onboardingAnswers")) || {};
    Object.keys(savedAnswers).forEach((key) => {
      setValue(key, savedAnswers[key]);
    });

    const savedStep = JSON.parse(localStorage.getItem("currentStep"));
    if (savedStep !== null) {
      setCurrentStep(savedStep);
    }
  }, [setValue]);

  const saveAnswers = (data) => {
    localStorage.setItem(
      "onboardingAnswers",
      JSON.stringify({ ...getValues(), ...data })
    );
  };

  const saveStep = (step) => {
    localStorage.setItem("currentStep", JSON.stringify(step));
  };

  const onNext = (data) => {
    saveAnswers(data);
    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveStep(nextStep);
    }
  };

  const onPrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveStep(prevStep);
    }
  };

  const onSubmit = (data) => {
    saveAnswers(data);
    console.log("Form submitted:", data);
    // Handle form submission (e.g., send data to server)
  };

  const progress = (currentStep / (questions.length - 1)) * 100;

  return (
    <div>
      <Progress value={progress} />
      {/*    <OnboardingCard question={questions[currentStep].question}> */}
      <Card className="w-[600px] shadow-md">
        <CardHeader>{questions[currentStep].question}</CardHeader>
        <form onSubmit={handleSubmit(onNext)}>
          <CardContent>
            <Controller
              control={control}
              name={questions[currentStep].name}
              render={({ field }) => (
                <input
                  {...field}
                  className="input"
                  placeholder={questions[currentStep].question}
                />
              )}
            />
            <div className="mt-4 flex justify-between">
              <Button
                type="button"
                onClick={onPrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              {currentStep < questions.length - 1 ? (
                <Button type="submit">Next</Button>
              ) : (
                <Button type="button" onClick={handleSubmit(onSubmit)}>
                  Finish
                </Button>
              )}
            </div>
          </CardContent>
        </form>
        <CardFooter>Zakina</CardFooter>
      </Card>
      {/*   </OnboardingCard> */}
    </div>
  );
};

export default OnboardingForm;
