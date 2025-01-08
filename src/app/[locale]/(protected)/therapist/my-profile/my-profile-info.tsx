"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import MyProfileForm from "./my-profile-form";
import { useLocale, useTranslations } from "next-intl";
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentRole } from "@/hooks/use-current-role";

const MyProfileInfo = ({
  therapistJson,
  adminPageProps,
}: {
  therapistJson: any;
  adminPageProps?: { therapistId: string };
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();
  const { responseToast } = useToast();
  const locale = useLocale();
  const { getFullName } = useUserName();
  const { isAdmin } = useCurrentRole();

  const therapist = JSON.parse(therapistJson);
  const [imageUrl, setImageUrl] = useState(therapist?.image);

  const t = useTranslations("TherapistProfilePage");

  const onUploadSuccess = async (uploadedFileKey: string) => {
    setUploadSuccess(true);
    startTransition(async () => {
      const data = await uploadTherapistProfileImage(
        uploadedFileKey,
        adminPageProps
      );
      responseToast(data);
      if (data.success) {
        setImageUrl(uploadedFileKey);
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
    setUploadSuccess(null);
  };

  return (
    <>
      <div className="rounded-lg p-6 mb-4 w-full bg-white">
        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div
            className="relative rounded-full cursor-pointer group"
            onClick={() => setIsImageDialogOpen(true)}
          >
            {/* eslint-disable */}
            <Avatar className="w-28 h-28">
              <AvatarImage src={imageUrl ? imageUrl : therapist?.image || ""} />
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
                  className="object-fill"
                />
              </AvatarFallback>
            </Avatar>

            {/* Edit Icon */}
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full group-hover:scale-110 transition-transform duration-150 ease-in-out">
              <MdEdit className="text-gray-600" />
            </div>
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-black opacity-0 rounded-full group-hover:opacity-20 transition-opacity duration-150 ease-in-out" />
          </div>

          {isEditing ? (
            <MyProfileForm
              therapist={therapist}
              setIsEditing={setIsEditing}
              adminPageProps={adminPageProps}
            />
          ) : (
            <>
              {/* Therapist Name & Email */}
              <h2 className="text-2xl font-bold mb-4">
                {getFullName(therapist.firstName, therapist.lastName)}
              </h2>
              <p className="text-gray-600 mb-8">{therapist.email}</p>
              {/* English Work Profile */}
              <div className="w-full">
                <h3 className="text-2xl font-bold mb-6">
                  {t("englishSection")}
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">
                    {t("workTitleLabelEn")}
                  </h4>
                  <p className="text-base text-gray-700">
                    {therapist.therapistWorkProfile?.en?.title ||
                      "No title provided"}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">
                    {t("workDescriptionLabelEn")}
                  </h4>
                  <div
                    className="text-base text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        therapist.therapistWorkProfile?.en?.description ||
                        "No description provided",
                    }}
                  />
                </div>
                {isAdmin && (
                  <div className="flex justify-center">
                    <Button onClick={() => setIsEditing(true)} className="mb-6">
                      {t("edit")}
                    </Button>
                  </div>
                )}
              </div>
              <Separator className="my-6" /> {/* Divider between sections */}
              {/* Arabic Work Profile */}
              <div className="w-full">
                <h3 className="text-2xl font-bold mb-6">
                  {t("arabicSection")}
                </h3>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">
                    {t("workTitleLabelAr")}
                  </h4>
                  <p className="text-base text-gray-700">
                    {therapist.therapistWorkProfile?.ar?.title ||
                      t("noTitleProvided")}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-2">
                    {t("workDescriptionLabelAr")}
                  </h4>
                  <div
                    className="text-base text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html:
                        therapist.therapistWorkProfile?.ar?.description ||
                        t("noDescriptionProvided"),
                    }}
                  />
                </div>
              </div>
              {/* Edit Button */}
              {isAdmin && (
                <Button onClick={() => setIsEditing(true)} className="mt-6">
                  {t("edit")}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="w-11/12 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("uploadProfileImage")}</DialogTitle>
          </DialogHeader>
          {uploadSuccess ? (
            <div className="flex flex-col items-center">
              {/* eslint-disable */}
              <img
                src={imageUrl}
                alt="Uploaded profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center text-green-600 mb-4">
                  <MdCheckCircle className="mr-2 text-2xl" />
                  <span>{t("uploadSuccess")}</span>
                </div>
                <Button onClick={handleCloseDialog}>{t("close")}</Button>
              </div>
            </div>
          ) : (
            <S3oosh config={S3ooshConfig} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyProfileInfo;
