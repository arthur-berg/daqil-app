import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const Loading = () => {
  return (
    <div className="flex justify-center">
      <Card className="sm:w-[500px] w-full">
        <CardHeader>
          <Skeleton className="w-48 h-6 mb-6 mx-auto" />
        </CardHeader>
        <CardContent>
          {/* Form Skeleton */}
          <div className="space-y-6">
            {/* Email Field Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-full h-10" />
            </div>

            {/* Password Field Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-full h-10" />
            </div>

            {/* New Password Field Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-full h-10" />
            </div>

            {/* Timezone Selector Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-48 h-5" />
              <Skeleton className="w-full h-10" />
            </div>

            {/* Save Button Skeleton */}
            <Skeleton className="w-48 h-10 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
