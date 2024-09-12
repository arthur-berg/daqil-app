import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  // Simulate loading of multiple therapist cards
  return (
    <div className="px-4 sm:px-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="shadow-lg rounded-lg overflow-hidden flex flex-col justify-between"
          >
            <CardContent className="p-6 flex flex-col items-center">
              {/* Image skeleton */}
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-4" />

              {/* Name skeleton */}
              <Skeleton className="w-48 h-6 mb-2" />

              {/* Email skeleton */}
              <Skeleton className="w-40 h-4 mb-4" />

              {/* Title skeleton */}
              <Skeleton className="w-36 h-5 mb-2" />

              {/* Description skeleton */}
              <Skeleton className="w-full h-20 mb-4" />

              {/* Read More button skeleton */}
              <Skeleton className="w-24 h-10" />
            </CardContent>

            <CardContent className="p-6">
              {/* Book Session button skeleton */}
              <Skeleton className="w-full h-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Loading;
