import VideoContent from "./video-content";

/* import { createSessionandToken } from "@/actions/video"; */

const VideoPage = async () => {
  const response = await fetch(`/api/video/2`);
  console.log("response", response);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();

  console.log("data", data);

  return <div></div>;
  /* <VideoContent /> */
};

export default VideoPage;
