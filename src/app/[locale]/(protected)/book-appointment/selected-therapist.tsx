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
import BookingCalendar from "@/app/[locale]/(protected)/book-appointment/[therapistId]/booking-calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaUser } from "react-icons/fa";

const SelectedTherapist = ({
  selectedTherapistData,
  appointmentType,
  locale,
}: {
  selectedTherapistData: any;
  appointmentType: any;
  locale: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const t = useTranslations("BookAppointmentPage");
  const selectedTherapist = JSON.parse(selectedTherapistData);

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-4 ">
        <div className="flex flex-col items-center">
          {/* Therapist Image or Placeholder */}
          {selectedTherapist.image ? (
            <Avatar className="w-28 h-28">
              <AvatarImage src={selectedTherapist.image || ""} />
              <AvatarFallback className="bg-background flex items-center justify-center w-full h-full">
                <FaUser className="text-4xl text-gray-500" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <h2 className="text-xl font-bold mb-2">
            {selectedTherapist.firstName} {selectedTherapist.lastName}
          </h2>
          <p className="text-gray-600 mb-2">
            {selectedTherapist.therapistWorkProfile[locale].title}
          </p>
          <p className="text-sm text-gray-700">
            {selectedTherapist.therapistWorkProfile[locale].description}
          </p>
        </div>
        <BookingCalendar
          therapistsAvailableTimes={JSON.stringify(
            selectedTherapist.availableTimes
          )}
          appointments={JSON.stringify(selectedTherapist.appointments)}
          appointmentType={appointmentType}
          therapistId={selectedTherapist._id}
          setChangeTherapistDialogOpen={setIsDialogOpen}
        />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
            <Link href="/book-appointment/browse-therapists">
              <Button>{t("browseTherapistsButton")}</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedTherapist;
