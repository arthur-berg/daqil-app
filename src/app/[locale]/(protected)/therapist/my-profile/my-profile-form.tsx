"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const MyProfileForm = ({
  therapist,
  setIsEditing,
}: {
  therapist: any;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [workTitleEn, setWorkTitleEn] = useState(
    therapist?.therapistWorkProfile?.en?.title || ""
  );
  const [workDescriptionEn, setWorkDescriptionEn] = useState(
    therapist?.therapistWorkProfile?.en?.description || ""
  );

  const [workTitleAr, setWorkTitleAr] = useState(
    therapist?.therapistWorkProfile?.ar?.title || ""
  );
  const [workDescriptionAr, setWorkDescriptionAr] = useState(
    therapist?.therapistWorkProfile?.ar?.description || ""
  );
  const [profileImage, setProfileImage] = useState(therapist?.image || "");

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving profile data:", {
      profileImage,
      therapistWorkProfile: {
        en: {
          title: workTitleEn,
          description: workDescriptionEn,
        },
        ar: {
          title: workTitleAr,
          description: workDescriptionAr,
        },
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset fields to original values
    setProfileImage(therapist.image || "");
    setWorkTitleEn(therapist.therapistWorkProfile?.en?.title || "");
    setWorkDescriptionEn(therapist.therapistWorkProfile?.en?.description || "");
    setWorkTitleAr(therapist.therapistWorkProfile?.ar?.title || "");
    setWorkDescriptionAr(therapist.therapistWorkProfile?.ar?.description || "");
    setIsEditing(false);
  };

  return (
    <div>
      {" "}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => setProfileImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
        className="mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">English</h3>
      <input
        type="text"
        value={workTitleEn}
        onChange={(e) => setWorkTitleEn(e.target.value)}
        placeholder="Title (EN)"
        className="mb-2 p-2 border border-gray-300 rounded w-full"
      />
      <textarea
        value={workDescriptionEn}
        onChange={(e) => setWorkDescriptionEn(e.target.value)}
        placeholder="Description (EN)"
        className="p-2 border border-gray-300 rounded w-full mb-4"
        rows={4}
      />
      <h3 className="text-lg font-semibold mb-2">Arabic</h3>
      <input
        type="text"
        value={workTitleAr}
        onChange={(e) => setWorkTitleAr(e.target.value)}
        placeholder="Title (AR)"
        className="mb-2 p-2 border border-gray-300 rounded w-full"
      />
      <textarea
        value={workDescriptionAr}
        onChange={(e) => setWorkDescriptionAr(e.target.value)}
        placeholder="Description (AR)"
        className="p-2 border border-gray-300 rounded w-full mb-4"
        rows={4}
      />
      <div className="flex space-x-4">
        <Button onClick={handleSave}>Save</Button>
        <Button onClick={handleCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default MyProfileForm;
