import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md p-4">
      <div className="flex flex-col items-center">
        <Skeleton className="w-48 h-6 mb-6" />

        <div className="w-full h-96 border border-gray-300 rounded-md mb-4">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default Loading;
