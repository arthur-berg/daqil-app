import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      {/* Go back button */}
      <div className="mb-4 flex items-center flex-col sm:items-start">
        <Skeleton className="w-40 h-10" />
      </div>

      {/* Client Name */}
      <div className="text-center mb-4">
        <Skeleton className="w-48 h-8 mx-auto" />
      </div>

      {/* Client Details */}
      <div className="space-y-2 text-center">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>

      {/* Therapist History */}
      {/* <div className="mt-6">
        <Skeleton className="w-40 h-6 mb-4" />
        <div className="space-y-4">
          {[...Array(1)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <Skeleton className="w-full h-6 mb-2" />
              <Skeleton className="w-full h-6 mb-2" />
              <Skeleton className="w-full h-6" />
            </div>
          ))}
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 justify-center sm:space-y-0">
        <Skeleton className="w-48 h-10 mx-auto" />
        {/* <Skeleton className="w-48 h-10 mx-auto" /> */}
      </div>
    </div>
  );
};

export default Loading;
