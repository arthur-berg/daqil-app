import VideoRoom from "@/app/[locale]/(protected)/video/[roomName]/video-room";
import { getCredentials } from "@/actions/video";

const VideoRoomPage = async ({ params }: { params: { roomName: string } }) => {
  const roomName = decodeURIComponent(params.roomName);
  const credentials = await getCredentials(roomName);

  return <VideoRoom credentials={credentials} roomName={roomName} />;
};

export default VideoRoomPage;
