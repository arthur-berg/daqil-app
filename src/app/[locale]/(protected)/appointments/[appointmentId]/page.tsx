import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";
import { getSessionData } from "@/actions/video";

const AppointmentSessionPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  const sessionData = await getSessionData(params.appointmentId);

  if (!sessionData) return;

  return <VideoRoom sessionData={sessionData} />;

  /*  return <VideoRoom credentials={credentials} roomName={roomName} />; */
};

export default AppointmentSessionPage;
