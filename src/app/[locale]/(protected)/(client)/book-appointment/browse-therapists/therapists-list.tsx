"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import NextAppointment from "./next-appointment";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useUserName } from "@/hooks/use-user-name";

const TherapistsList = ({ therapistsJson }: { therapistsJson: any }) => {
  const therapists = JSON.parse(therapistsJson);
  const [selectedSex, setSelectedSex] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(
    "Both"
  );
  const { getFullName } = useUserName();
  const locale = useLocale();
  const t = useTranslations("BookAppointmentPage");
  const maxDescriptionLength = 200;

  const filteredTherapists = therapists?.filter((therapist: any) => {
    const matchesSex =
      selectedSex === null || therapist.personalInfo?.sex === selectedSex;

    const matchesLanguage =
      !therapist.settings?.languages || // Show therapists with undefined or empty languages
      selectedLanguage === "Both" ||
      therapist.settings.languages.includes(
        selectedLanguage === "English" ? "en" : "ar"
      );

    return matchesSex && matchesLanguage;
  });

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
        <div className="flex space-x-2">
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists?.map((therapist: any) => (
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
                    {therapist.therapistWorkProfile[locale].description.length >
                    maxDescriptionLength ? (
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
                            therapist.therapistWorkProfile[locale].description,
                        }}
                      />
                    )}
                  </div>
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
        ))}
      </div>
    </div>
  );
};

export default TherapistsList;
