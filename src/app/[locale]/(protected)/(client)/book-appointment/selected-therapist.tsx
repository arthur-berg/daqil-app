"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserName } from "@/hooks/use-user-name";
import BookingCalendar from "./[therapistId]/booking-calendar";
import Image from "next/image";

const SelectedTherapist = ({
  selectedTherapistData,
  appointmentTypes,
  locale,
}: {
  selectedTherapistData: any;
  appointmentTypes: any[];
  locale: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { getFullName } = useUserName();
  const t = useTranslations("BookAppointmentPage");
  const selectedTherapist = JSON.parse(selectedTherapistData);

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
        <div className="flex flex-col items-center mb-4">
          {/* Therapist Image or Placeholder */}

          <Avatar className="w-28 h-28">
            <AvatarImage src={selectedTherapist.image || ""} />
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

          <h2 className="text-xl font-bold mb-2">
            {getFullName(
              selectedTherapist.firstName,
              selectedTherapist.lastName
            )}
          </h2>

          <p className="text-gray-600">
            {selectedTherapist.therapistWorkProfile[locale].title}
          </p>
          <div className="mb-2">
            <Link
              href={`/therapist/${selectedTherapist._id}?selectedTherapistView=true`}
            >
              <Button variant="ghost" size="sm">
                {t("goToProfilePage")}
              </Button>
            </Link>
          </div>
          {/* <p className="text-sm text-gray-700">
            {selectedTherapist.therapistWorkProfile[locale].description}
          </p> */}
        </div>
        <BookingCalendar
          therapistsAvailableTimes={JSON.stringify(
            selectedTherapist.availableTimes
          )}
          showOnlyIntroCalls={false}
          appointments={JSON.stringify(selectedTherapist.appointments)}
          appointmentTypes={appointmentTypes}
          therapistId={selectedTherapist._id}
          setChangeTherapistDialogOpen={setIsDialogOpen}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("changeTherapistTitle")}</DialogTitle>
            <DialogDescription>
              {t("changeTherapistDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("close")}
            </Button>
            <div className="flex mb-4 sm:mb-0">
              <Link
                href="/book-appointment/browse-therapists"
                className="w-full"
              >
                <Button className="w-full">
                  {t("browseTherapistsButton")}
                </Button>
              </Link>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedTherapist;
