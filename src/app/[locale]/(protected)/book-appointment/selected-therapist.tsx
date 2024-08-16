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

const SelectedTherapist = ({
  selectedTherapistData,
  appointmentType,
}: {
  selectedTherapistData: any;
  appointmentType: any;
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
            <img
              src={selectedTherapist.image}
              alt={`${selectedTherapist.firstName} ${selectedTherapist.lastName}`}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <h2 className="text-xl font-bold mb-2">
            {selectedTherapist.firstName} {selectedTherapist.lastName}
          </h2>
          <p className="text-gray-600 mb-2">{selectedTherapist.email}</p>
          <p className="text-sm text-gray-700">
            {selectedTherapist.description}
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
