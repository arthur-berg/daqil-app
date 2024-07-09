import MeetingsBody from "@/app/[locale]/(protected)/meetings/meetings-body";
import LoadingSpinner from "@/components/loading-spinner";
import { Suspense } from "react";

const MeetingsPage = async () => {
  return (
    <div className="relative min-h-screen bg-gray-100 p-8 w-full">
      <h1 className="text-3xl font-bold mb-8">Meeting Rooms</h1>
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 flex-col">
            <LoadingSpinner />
            <div className="bg-white rounded-md mt-2 p-2 text-sm">
              Loading meetings...
            </div>
          </div>
        }
      >
        <MeetingsBody />{" "}
      </Suspense>
    </div>
  );
};

export default MeetingsPage;
