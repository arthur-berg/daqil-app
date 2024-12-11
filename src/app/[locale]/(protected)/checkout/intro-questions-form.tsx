"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea"; // Shadcn Textarea component
import { cn } from "@/lib/utils"; // Utility for conditional classes (if needed)
import { useTranslations } from "next-intl";

const IntroQuestionsForm = ({ onComplete }: { onComplete: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(4).fill(""));
  const [progress, setProgress] = useState(0);
  const [touched, setTouched] = useState(false);

  const t = useTranslations("IntroCheckoutTranslation");

  const handleInputChange = (value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentSlide] = value;
    setAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentSlide < 3) {
      setCurrentSlide(currentSlide + 1);
      setProgress(((currentSlide + 1) / 4) * 100);
      setTouched(false);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      setProgress(((currentSlide - 1) / 4) * 100);
    }
  };

  return (
    <div className="mb-10">
      {/* Progress Bar */}
      <div className="mb-6 p-4 bg-blue-100 text-blue-800 text-center rounded-md">
        <h1 className="text-2xl font-bold mb-2">{t("introQuestionsHeader")}</h1>
        <p className="text-lg">{t("introQuestionsSubHeader")}</p>
      </div>
      <Progress value={progress} className="mb-6" />

      {/* Question */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">
          {t(`question${currentSlide + 1}`)}
        </h2>
        <Textarea
          value={answers[currentSlide]}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4} // Set the number of rows for the textarea
          className={cn(
            "mt-4",
            touched && !answers[currentSlide] ? "border-red-500" : ""
          )}
          placeholder={t("placeholder")}
        />
        {touched && !answers[currentSlide] && (
          <p className="text-red-500 text-sm mt-2">{t("validationError")}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentSlide === 0}
        >
          {t("back")}
        </Button>
        <Button onClick={handleNext} disabled={!answers[currentSlide]}>
          {currentSlide === 3 ? t("finish") : t("continue")}
        </Button>
      </div>
    </div>
  );
};

export default IntroQuestionsForm;
