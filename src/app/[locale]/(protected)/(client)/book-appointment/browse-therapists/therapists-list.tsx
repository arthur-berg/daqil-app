"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import NextAppointment from "./next-appointment";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useUserName } from "@/hooks/use-user-name";
import { SYMPTOM_OPTIONS } from "@/contants/config";
import { Checkbox } from "@/components/ui/checkbox";
import { MdAdd } from "react-icons/md";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const MAX_VISIBLE_SYMPTOMS = 3;

const TherapistsList = ({ therapistsJson }: { therapistsJson: any }) => {
  const therapists = JSON.parse(therapistsJson);
  const [selectedSex, setSelectedSex] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    "Both"
  );
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [visibleSymptomsCount, setVisibleSymptomsCount] = useState<{
    [therapistId: string]: number;
  }>({});
  const [symptomSearch, setSymptomSearch] = useState("");
  const { getFullName } = useUserName();
  const locale = useLocale();
  const t = useTranslations("BookAppointmentPage");
  const tSymptoms = useTranslations("Symptoms");
  const maxDescriptionLength = 200;

  const filteredTherapists = therapists?.filter((therapist: any) => {
    const matchesSex =
      selectedSex === null || therapist.personalInfo?.sex === selectedSex;

    const matchesLanguage =
      !therapist.settings?.languages ||
      selectedLanguage === "Both" ||
      therapist.settings.languages.includes(
        selectedLanguage === "English" ? "en" : "ar"
      );

    const matchesSymptoms =
      selectedSymptoms.length === 0 ||
      (therapist.settings?.treatedSymptoms &&
        selectedSymptoms.every((symptom) =>
          therapist.settings.treatedSymptoms.includes(symptom)
        ));

    return matchesSex && matchesLanguage && matchesSymptoms;
  });

  const handleShowMore = (therapistId: string) => {
    setVisibleSymptomsCount((prev) => ({
      ...prev,
      [therapistId]:
        (prev[therapistId] || MAX_VISIBLE_SYMPTOMS) + MAX_VISIBLE_SYMPTOMS,
    }));
  };
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
  };

  const clearAllSymptoms = () => setSelectedSymptoms([]);

  const allSymptomsSelected = selectedSymptoms.length === 0;

  return (
    <div>
      <div className="bg-gray-100 p-4 mb-6 rounded-md shadow-sm">
        <h2 className="text-lg font-bold mb-2">{t("filterBy")}</h2>
        <div className="flex space-x-2 mb-4">
          {/* Sex Filter */}
          <Button
            variant={!selectedSex ? "default" : "outline"}
            onClick={() => setSelectedSex(null)}
          >
            {t("all")}
          </Button>
          <Button
            variant={selectedSex === "MALE" ? "default" : "outline"}
            onClick={() =>
              setSelectedSex(selectedSex === "MALE" ? null : "MALE")
            }
          >
            {t("male")}
          </Button>
          <Button
            variant={selectedSex === "FEMALE" ? "default" : "outline"}
            onClick={() =>
              setSelectedSex(selectedSex === "FEMALE" ? null : "FEMALE")
            }
          >
            {t("female")}
          </Button>
        </div>
        <div className="flex space-x-2 mb-4">
          {/* Language Filter */}
          <Button
            variant={selectedLanguage === "Both" ? "default" : "outline"}
            onClick={() => setSelectedLanguage("Both")}
          >
            {t("bothLanguages")}
          </Button>
          <Button
            variant={selectedLanguage === "English" ? "default" : "outline"}
            onClick={() => setSelectedLanguage("English")}
          >
            {t("english")}
          </Button>
          <Button
            variant={selectedLanguage === "Arabic" ? "default" : "outline"}
            onClick={() => setSelectedLanguage("Arabic")}
          >
            {t("arabic")}
          </Button>
        </div>

        {/* <h2 className="text-lg font-bold mb-2">{t("filterBy")}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {allSymptomsSelected
            ? t("allSymptomsDefault")
            : t("filtersApplied", { count: selectedSymptoms.length })}
        </p>

        <div className="w-64 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full">
                {allSymptomsSelected
                  ? t("allSymptoms")
                  : t("filtersAppliedShort", {
                      count: selectedSymptoms.length,
                    })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder={t("searchSymptoms")}
                  value={symptomSearch}
                  onValueChange={setSymptomSearch}
                />
                <CommandList>
                  <CommandEmpty>{t("noSymptomsFound")}</CommandEmpty>
                  <CommandGroup>
                    {SYMPTOM_OPTIONS.filter((symptom: any) =>
                      symptom.value
                        .toLowerCase()
                        .includes(symptomSearch.toLowerCase())
                    ).map((symptom) => (
                      <CommandItem
                        key={symptom.value}
                        onSelect={() => toggleSymptom(symptom.value)}
                      >
                        <Checkbox
                          id={symptom.value}
                          checked={selectedSymptoms.includes(symptom.value)}
                          onCheckedChange={() => toggleSymptom(symptom.value)}
                        />
                        <label htmlFor={symptom.value} className="ml-2">
                          {tSymptoms(symptom.value)}
                        </label>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
 */}
        {/* Selected Symptoms */}
        {/* <div className="flex flex-wrap gap-2 mb-4">
          {selectedSymptoms.length > 0 ? (
            selectedSymptoms.map((symptom) => (
              <Badge
                key={symptom}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span>{tSymptoms(symptom)}</span>
                <Button
                  onClick={() => removeSymptom(symptom)}
                  className="ml-1 h-auto p-0"
                  variant="destructive"
                  size="icon"
                >
                  &times;
                </Button>
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="text-gray-600">
              {t("noSymptomsSelected")}
            </Badge>
          )}
        </div>

        {selectedSymptoms.length > 0 && (
          <Button variant="link" className="text-sm" onClick={clearAllSymptoms}>
            {t("clearAllFilters")}
          </Button>
        )} */}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists?.map((therapist: any) => {
          const visibleSymptoms =
            visibleSymptomsCount[therapist._id] || MAX_VISIBLE_SYMPTOMS;

          return (
            <div
              key={therapist.email}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
            >
              <div className="flex flex-col items-center p-6">
                <div className="flex justify-center mt-4">
                  <Avatar className="w-28 h-28">
                    <AvatarImage
                      src={therapist?.image || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
                      <Image
                        width={150}
                        height={50}
                        src={
                          locale === "en"
                            ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
                            : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png"
                        }
                        alt="psychologist-image"
                        className="w-full"
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="font-bold text-lg sm:text-xl mb-4 text-center mt-2">
                  {getFullName(therapist.firstName, therapist.lastName)}
                </div>
                {therapist.therapistWorkProfile && (
                  <div className="text-sm text-gray-700 mb-4 text-center">
                    <div className="font-semibold mb-2 text-base sm:text-lg">
                      {therapist.therapistWorkProfile[locale].title}
                    </div>
                    <div className="leading-relaxed">
                      {therapist.therapistWorkProfile[locale].description
                        .length > maxDescriptionLength ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              therapist.therapistWorkProfile[
                                locale
                              ].description.slice(0, maxDescriptionLength) +
                              "...",
                          }}
                        />
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              therapist.therapistWorkProfile[locale]
                                .description,
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
                {therapist.settings?.treatedSymptoms?.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-2 mb-4">
                    {therapist.settings.treatedSymptoms
                      .slice(0, visibleSymptoms)
                      .map((symptom: string) => (
                        <span
                          key={symptom}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center leading-tight h-[30px]"
                        >
                          {tSymptoms(symptom)}
                        </span>
                      ))}
                    {therapist.settings.treatedSymptoms.length >
                      visibleSymptoms && (
                      <Button
                        variant="link"
                        className="text-xs flex items-center space-x-1 h-[30px] px-2"
                        onClick={() => handleShowMore(therapist._id)}
                      >
                        <MdAdd className="w-4 h-4" />
                        <span>{t("showMore")}</span>
                      </Button>
                    )}
                  </div>
                )}
                {therapist.nextAvailableSlot && (
                  <NextAppointment
                    nextAvailable={t("nextAvailable")}
                    nextAvailableSlot={therapist.nextAvailableSlot}
                  />
                )}
                <Link href={`/therapist/${therapist._id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    {t("readMore")}
                  </Button>
                </Link>
              </div>
              <div className="pb-6">
                <div className="mt-auto flex justify-center">
                  <Link href={`/book-appointment/${therapist._id}`}>
                    <Button>{t("bookSession")}</Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TherapistsList;
