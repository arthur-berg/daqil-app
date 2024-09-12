import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const SelectedTherapistSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative flex justify-center">
        <div className="p-4 max-w-6xl w-full">
          <Card className="bg-white shadow-lg rounded-lg p-6 mb-4">
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <Skeleton className="w-28 h-28 rounded-full bg-gray-200 mb-4" />

                <Skeleton className="w-40 h-6 mb-2 bg-gray-300" />

                <Skeleton className="w-32 h-4 bg-gray-200 mb-4" />

                <Skeleton className="w-24 h-10 bg-gray-200 mb-4" />

                <div className="w-full">
                  <Skeleton className="w-full h-10 mb-4 bg-gray-200" />
                  <Skeleton className="w-full h-10 mb-4 bg-gray-200" />
                  <Skeleton className="w-full h-10 mb-4 bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelectedTherapistSkeleton;
