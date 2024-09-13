import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md">
      <div className="flex flex-col items-center">
        {/* Profile Image Skeleton */}
        <Skeleton className="w-24 h-24 rounded-full mb-4" />

        {/* Name Skeleton */}
        <Skeleton className="w-40 h-8 mb-2" />

        {/* Email Skeleton */}
        <Skeleton className="w-48 h-6 mb-8" />

        {/* English Section */}
        <div className="w-full">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="mb-6">
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
          </div>
          <div className="mb-6">
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-full h-4 mb-1" />
          </div>
          <Skeleton className="w-24 h-8 mb-6 mx-auto" />
        </div>

        {/* Divider Skeleton */}
        <Skeleton className="w-full h-px bg-gray-300 mb-6" />

        {/* Arabic Section */}
        <div className="w-full">
          <Skeleton className="w-32 h-6 mb-4" />
          <div className="mb-6">
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
          </div>
          <div className="mb-6">
            <Skeleton className="w-24 h-5 mb-2" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-full h-4 mb-1" />
          </div>
          <Skeleton className="w-24 h-8 mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
