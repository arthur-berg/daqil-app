import LoadingSpinner from "@/components/loading-spinner";

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <LoadingSpinner />
      <div className="text-lg font-medium text-white">
        Loading video session... Please wait
      </div>
    </div>
  );
};

export default Loading;
