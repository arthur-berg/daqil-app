import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-md">
      {/* Reservation Section */}
      <div className="flex justify-center mb-4">
        <Skeleton className="w-48 h-10" />
      </div>

      {/* Countdown Skeleton */}
      <div className="text-center mb-6">
        <Skeleton className="w-32 h-6 mx-auto" />
      </div>

      {/* Appointment Details Skeleton */}
      <div className="p-4 rounded-md mb-6">
        <Skeleton className="w-40 h-6 mb-2" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-full h-4 mb-1" />
        <Skeleton className="w-full h-4 mb-1" />
      </div>

      {/* Discount Code Form Skeleton */}
      <div className="mb-8">
        <Skeleton className="w-32 sm:w-48 h-6 mb-2" />
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <Skeleton className="w-full sm:w-60 h-10" />
          <Skeleton className="w-full sm:w-24 h-10" />
        </div>
      </div>

      {/* Payment Button Skeleton */}
      <div className="text-center mt-8">
        <Skeleton className="w-48 h-12 mx-auto" />
      </div>
    </div>
  );
};

export default Loading;
