"use client";

import OT from "@opentok/client";
import { useEffect } from "react";

const handleError = (error: any) => {
  if (error) {
    alert(error.message);
  }
};

const VideoContent = ({ videoData }: { videoData: any }) => {
  const appId = videoData.appId;
  const sessionId = videoData.sessionId;
  const token = videoData.token;

  useEffect(() => {
    console.log("WINDOW", window);
    if (typeof window !== "undefined") {
      const session = OT.initSession(appId, sessionId);

      const publisher = OT.initPublisher(
        "publisher",
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        handleError
      );

      session.connect(token, function (error) {
        if (error) {
          handleError(error);
        } else {
          session.publish(publisher, handleError);
        }
      });

      session.on("streamCreated", function (event) {
        session.subscribe(
          event.stream,
          "subscriber",
          {
            insertMode: "append",
            width: "100%",
            height: "100%",
          },
          handleError
        );
      });
      return () => {
        session.disconnect();
      };
    }
  }, [appId, sessionId, token]);

  return (
    <div className="flex items-center justify-center">
      <div id="subscriber" className="w-40 h-40"></div>
      <div
        id="publisher"
        className="w-40 h-40 border-3 border-white border-solid rounded-md"
      ></div>
    </div>
  );
};

export default VideoContent;
