import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      {/* Title Skeleton */}
      <div className="text-center mb-6">
        <Skeleton className="w-48 h-8 mx-auto" />
      </div>

      {/* Table Header Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>

      {/* Table Rows Skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="grid grid-cols-3 gap-4 mb-2">
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-full h-6" />
          <Skeleton className="w-full h-6" />
        </div>
      ))}
    </div>
  );
};

export default Loading;
