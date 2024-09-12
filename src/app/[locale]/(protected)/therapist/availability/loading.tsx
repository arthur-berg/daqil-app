import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-6">
      {/* Tabs Skeleton for Desktop */}
      <div className="hidden md:flex space-x-4">
        <Skeleton className="w-32 h-10" />
        <Skeleton className="w-40 h-10" />
        <Skeleton className="w-52 h-10" />
        <Skeleton className="w-48 h-10" />
      </div>

      {/* Select Skeleton for Mobile */}
      <div className="block md:hidden">
        <Skeleton className="w-full h-10 mb-4" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Overview Section */}
        <div className="space-y-4">
          <Skeleton className="w-64 h-6" />
          <Skeleton className="w-full h-20" />
        </div>

        {/* Recurring Availability Section */}
        <div className="space-y-4">
          <Skeleton className="w-64 h-6" />
          <Skeleton className="w-full h-20" />
        </div>

        {/* Non-Recurring Availability Section */}
        <div className="space-y-4">
          <Skeleton className="w-64 h-6" />
          <Skeleton className="w-full h-20" />
        </div>

        {/* Blocked Times Section */}
        <div className="space-y-4">
          <Skeleton className="w-64 h-6" />
          <Skeleton className="w-full h-20" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
