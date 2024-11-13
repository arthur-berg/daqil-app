import { getSessionData } from "@/actions/videoSessions/actions";
import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";

const AppointmentSessionPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  const sessionData = await getSessionData(params.appointmentId);

  if (!sessionData) return;

  console.log("sessionData", sessionData);

  return (
    <div>
      <VideoRoom sessionData={sessionData} />
    </div>
  );
};

export default AppointmentSessionPage;
