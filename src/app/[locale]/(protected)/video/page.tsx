import VideoContent from "./video-content";

/* import { createSessionandToken } from "@/actions/video"; */

const VideoPage = async () => {
  const response = await fetch(`http://localhost:3000/api/video/2`);
  /* console.log("response", response); */
  if (!response.ok) {
    /*  console.log("response"); */

    return <div>Error</div>;
  }

  const data = await response.json();

  console.log("Data recieved in server side component", data);

  return <VideoContent videoData={data} />;
};

export default VideoPage;
