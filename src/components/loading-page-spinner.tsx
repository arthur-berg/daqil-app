import { BeatLoader } from "react-spinners";

const LoadingPageSpinner = async ({ tValue }: { tValue: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-196px)] lg:h-[calc(100vh-154px)] space-y-4">
      <BeatLoader color="white" />
      <div className="text-lg font-medium text-white">{tValue}</div>
    </div>
  );
};

export default LoadingPageSpinner;
