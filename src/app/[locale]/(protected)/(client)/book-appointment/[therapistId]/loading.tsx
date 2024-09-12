import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const Loading = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
      {/* Go Back Button Skeleton */}
      <div className="flex justify-start mb-4">
        <Skeleton className="w-24 h-10" />
      </div>

      <div className="flex flex-col items-center justify-center">
        {/* Therapist Avatar and Info Skeleton */}
        <div className="flex flex-col items-center">
          {/* Therapist Avatar Skeleton */}
          <Skeleton className="w-28 h-28 rounded-full mb-4" />

          {/* Therapist Name Skeleton */}
          <Skeleton className="w-48 h-6 mb-2" />

          {/* Therapist Title Skeleton */}
          <Skeleton className="w-36 h-5 mb-4" />
        </div>

        <div className="w-full h-96 border border-gray-300 rounded-md mb-4">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
