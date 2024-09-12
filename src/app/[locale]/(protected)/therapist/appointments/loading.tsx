import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = async () => {
  return (
    <div className="flex justify-center">
      <Card className="w-full md:w-8/12">
        <CardContent className="w-full">
          <div className="flex justify-center py-8">
            <div className="space-y-8 w-full max-w-4xl">
              {/* Switch Skeleton */}
              <div className="flex justify-center mb-4">
                <Skeleton className="w-32 h-10 mr-2" />{" "}
                {/* List View Button Skeleton */}
                <Skeleton className="w-32 h-10" />{" "}
                {/* Calendar View Button Skeleton */}
              </div>

              {/* Title Skeleton */}
              <div className="flex justify-center">
                <div className="flex justify-center items-center flex-col">
                  <Skeleton className="w-full h-10 bg-gray-200 mb-2" />
                </div>
              </div>

              {/* Content Skeleton */}
              <div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="w-40 h-5 bg-gray-300 mb-2" />
                    <Skeleton className="w-full h-8 bg-gray-200 mb-2" />
                    <Skeleton className="w-full h-8 bg-gray-200 mb-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
