import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="h-full flex items-center justify-center container">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <Skeleton className="w-[60%] h-[58.5312px] sm:h-[141.703px]" />
            <Skeleton className="w-60 h-6" />
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <Skeleton className="w-32 h-6 mb-3" />
                <Skeleton className="w-full h-12" />
              </div>
              <div>
                <Skeleton className="w-32 h-6 mb-3" />
                <Skeleton className="w-full h-12" />
              </div>
              <Skeleton className="w-40 h-6" />
            </div>
            <Skeleton className="w-full h-14" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Loading;
