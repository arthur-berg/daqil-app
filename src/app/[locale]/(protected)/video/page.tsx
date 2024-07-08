import VideoContent from "./video-content";

const VideoPage = async () => {
  const response = await fetch(`http://localhost:3000/api/video/2`, {
    cache: "no-store",
    method: "GET",
  });
  if (!response.ok) {
    return <div>Error</div>;
  }

  const data = await response.json();

  return <VideoContent videoData={data} />;
};

export default VideoPage;
