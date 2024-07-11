/* import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room"; */
/* import { getCredentials } from "@/actions/video"; */

const VideoRoomPage = async ({ params }: { params: { roomName: string } }) => {
  /*   const roomName = decodeURIComponent(params.roomName);
  const credentials = await getCredentials(roomName);

  if (!credentials) return; */

  return <div>test</div>;

  /*  return <VideoRoom credentials={credentials} roomName={roomName} />; */
};

export default VideoRoomPage;
