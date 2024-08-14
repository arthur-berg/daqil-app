"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming you have a Button component
import MyProfileForm from "./my-profile-form";

const MyProfileInfo = ({ therapistJson }: { therapistJson: any }) => {
  const [isEditing, setIsEditing] = useState(false);

  const therapist = JSON.parse(therapistJson);

  return (
    <div className="bg-white rounded-lg p-6 mb-4 max-w-4xl mx-auto">
      <div className="flex flex-col items-center">
        {therapist?.image ? (
          <img
            src={therapist?.image}
            alt={`${therapist.firstName} ${therapist.lastName}`}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <span className="text-gray-500">No image</span>
          </div>
        )}
        {isEditing ? (
          <>
            <MyProfileForm therapist={therapist} setIsEditing={setIsEditing} />
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">
              {therapist.firstName} {therapist.lastName}
            </h2>
            <p className="text-gray-600 mb-2">{therapist.email}</p>
            <h3 className="text-lg font-semibold mb-2">English</h3>
            <p className="text-sm text-gray-700">
              {therapist.therapistWorkProfile?.en?.title}
            </p>
            <p className="text-sm text-gray-700">
              {therapist.therapistWorkProfile?.en?.description}
            </p>
            <h3 className="text-lg font-semibold mb-2">Arabic</h3>
            <p className="text-sm text-gray-700">
              {therapist.therapistWorkProfile?.ar?.title}
            </p>
            <p className="text-sm text-gray-700">
              {therapist.therapistWorkProfile?.ar?.description}
            </p>
            <Button onClick={() => setIsEditing(true)} className="mt-4">
              Edit
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProfileInfo;
