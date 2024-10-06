import AvailabilityWrapper from "@/app/[locale]/(protected)/therapist/availability/availability-wrapper";

const AvailabilityPage = async ({
  params,
}: {
  params: { therapistId: string };
}) => {
  return (
    <div>
      <AvailabilityWrapper
        adminPageProps={{ therapistId: params.therapistId }}
      />
    </div>
  );
};

export default AvailabilityPage;
