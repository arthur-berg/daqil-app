import { Skeleton } from "@/components/ui/skeleton";
import { getTranslations } from "next-intl/server";

const Loading = async () => {
  const t = await getTranslations("AppointmentList");

  return (
    <>
      <div className="bg-secondary p-4 rounded-md mb-6 w-full xl:w-9/12 flex mx-auto">
        <h1 className="text-3xl font-bold text-center text-primary flex-grow">
          {t("appointments")}
        </h1>
      </div>
      <div className="flex justify-center">
        <div className="w-full xl:w-9/12 p-2 sm:p-6 rounded-xl bg-white">
          <div className="w-full">
            <div className="flex justify-center py-8">
              <div className="space-y-8 w-full max-w-4xl">
                <div className="flex justify-center">
                  <div className="flex justify-center items-center flex-col">
                    <Skeleton className="w-full h-10 bg-gray-200 mb-2" />
                  </div>
                </div>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;
