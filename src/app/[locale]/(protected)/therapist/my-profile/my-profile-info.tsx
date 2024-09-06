"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import MyProfileForm from "./my-profile-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MdEdit, MdCheckCircle } from "react-icons/md";
import S3oosh from "@/components/s3oosh";
import { uploadTherapistProfileImage } from "@/actions/therapist-profile";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { useUserName } from "@/hooks/use-user-name";

const MyProfileInfo = ({ therapistJson }: { therapistJson: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const { getFullName } = useUserName();

  const therapist = JSON.parse(therapistJson);
  const [imageUrl, setImageUrl] = useState(therapist?.image);

  const t = useTranslations("TherapistProfilePage");

  const onUploadSuccess = async (uploadedFileKey: string) => {
    setUploadSuccess(true);
    startTransition(async () => {
      const data = await uploadTherapistProfileImage(uploadedFileKey);
      responseToast(data);
      if (data.success) {
        setImageUrl(uploadedFileKey); // Update the image URL with the new image path
      }
    });
  };

  const S3ooshConfig = {
    maxTotalFiles: 1,
    successCallback: onUploadSuccess,
    maxSize: 10485760, // 10 MB
    acceptedFileTypes: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
  };

  const handleCloseDialog = () => {
    setIsImageDialogOpen(false);
    setUploadSuccess(null); // Reset success state when closing the dialog
  };

  return (
    <>
      <div className="rounded-lg p-6 mb-4 w-full bg-white">
        <div className="flex flex-col items-center">
          <div
            className="relative w-24 h-24 rounded-full cursor-pointer group"
            onClick={() => setIsImageDialogOpen(true)}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${getFullName(therapist.firstName, therapist.lastName)}`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}

            {/* Edit Icon */}
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full group-hover:scale-110 transition-transform duration-150 ease-in-out">
              <MdEdit className="text-gray-600" />
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-black opacity-0 rounded-full group-hover:opacity-20 transition-opacity duration-150 ease-in-out" />
          </div>
          {isEditing ? (
            <MyProfileForm therapist={therapist} setIsEditing={setIsEditing} />
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">
                {getFullName(therapist.firstName, therapist.lastName)}
              </h2>
              <p className="text-gray-600 mb-4">{therapist.email}</p>

              <div className="w-full flex flex-col items-center md:items-start md:flex-row md:gap-8 justify-around">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("englishSection")}
                  </h3>
                  <div className="mb-4">
                    <label className="text-md font-bold text-gray-600">
                      {t("workTitleLabelEn")}
                    </label>
                    <p className="text-sm text-gray-700">
                      {therapist.therapistWorkProfile?.en?.title ||
                        "No title provided"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="text-md font-bold text-gray-600">
                      {t("workDescriptionLabelEn")}
                    </label>
                    <p className="text-sm text-gray-700">
                      {therapist.therapistWorkProfile?.en?.description ||
                        "No description provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t("arabicSection")}
                  </h3>
                  <div className="mb-4">
                    <label className="text-md font-bold text-gray-600">
                      {t("workTitleLabelAr")}
                    </label>
                    <p className="text-sm text-gray-700">
                      {therapist.therapistWorkProfile?.ar?.title ||
                        "No title provided"}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="text-md font-bold text-gray-600">
                      {t("workDescriptionLabelAr")}
                    </label>
                    <p className="text-sm text-gray-700">
                      {therapist.therapistWorkProfile?.ar?.description ||
                        "No description provided"}
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsEditing(true)} className="mt-4">
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
      <Dialog open={isImageDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("uploadProfileImage")}</DialogTitle>
          </DialogHeader>
          {uploadSuccess ? (
            <>
              <img
                src={therapist.image}
                alt="Uploaded profile"
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center text-green-600 mb-4">
                  <MdCheckCircle className="mr-2 text-2xl" />
                  <span>{t("uploadSuccess")}</span>
                </div>
                <Button onClick={handleCloseDialog}>Close</Button>
              </div>
            </>
          ) : (
            <S3oosh config={S3ooshConfig} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyProfileInfo;
