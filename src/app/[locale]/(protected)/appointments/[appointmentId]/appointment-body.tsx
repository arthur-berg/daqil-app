import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";
import { getSessionData } from "@/actions/videoSessions/actions";

const AppointmentBody = async ({
  appointmentId,
}: {
  appointmentId: string;
}) => {
  const sessionData = await getSessionData(appointmentId);

  if (!sessionData) return;

  return <VideoRoom sessionData={sessionData} />;
};

export default AppointmentBody;
