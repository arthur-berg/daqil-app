import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="bg-white max-w-3xl mx-auto p-6 rounded-lg shadow-lg">
      <Skeleton className="h-8 w-3/4 mb-8" />

      <section className="mb-8">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm">
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-full mb-4" />
        </div>
      </section>

      <section className="mb-8">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <Skeleton className="h-5 w-full mb-4" />
          <Skeleton className="h-5 w-full mb-4" />
        </div>
      </section>
    </div>
  );
};

export default Loading;
