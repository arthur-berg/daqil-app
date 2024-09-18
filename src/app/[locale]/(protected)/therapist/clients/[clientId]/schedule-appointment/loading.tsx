import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="mb-4">
        <Skeleton className="w-40 h-10" />
      </div>

      <div className="mb-8 text-center">
        <Skeleton className="w-64 h-8 mx-auto" />
      </div>

      <div className="mb-6">
        <Skeleton className="w-full h-10" />
      </div>

      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <Skeleton className="w-24 h-6 mb-2" />
        <Skeleton className="w-32 h-6" />
      </div>

      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <Skeleton className="w-24 h-6 mb-2" />
        <Skeleton className="w-32 h-6" />
      </div>

      <div className="mb-6">
        <Skeleton className="w-full h-10 mb-2" />
        <Skeleton className="w-48 h-6" />
      </div>

      <div className="mb-6">
        <Skeleton className="w-full h-10 mb-2" />
        <Skeleton className="w-48 h-6" />
      </div>

      <div className="text-center">
        <Skeleton className="w-48 h-12 mx-auto" />
      </div>
    </div>
  );
};

export default Loading;
