import { getSessionData } from "@/actions/videoSessions/actions";
import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";

const AppointmentSessionPage = async ({
  params,
  searchParams,
}: {
  params: { appointmentId: string };
  searchParams: { disablePreview?: string };
}) => {
  const sessionData = await getSessionData(params.appointmentId);

  if (!sessionData) return;

  const { disablePreview } = searchParams;

  return (
    <div>
      <VideoRoom sessionData={sessionData} disablePreview={!!disablePreview} />
    </div>
  );
};

export default AppointmentSessionPage;
