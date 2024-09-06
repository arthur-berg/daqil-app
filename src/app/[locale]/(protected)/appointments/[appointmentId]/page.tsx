import { getSessionData } from "@/actions/videoSessions/actions";
import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";
import connectToMongoDB from "@/lib/mongoose";

const AppointmentSessionPage = async ({
  params,
}: {
  params: { appointmentId: string };
}) => {
  await connectToMongoDB();
  const sessionData = await getSessionData(params.appointmentId);

  if (!sessionData) return;

  return <VideoRoom sessionData={sessionData} />;
};

export default AppointmentSessionPage;
