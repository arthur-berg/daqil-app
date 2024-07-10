"use client";

import { useEffect, useRef, useState } from "react";
import useRoom from "@/hooks/use-room";
import { useCurrentUser } from "@/hooks/use-current-user";
import useScreenSharing from "@/hooks/use-screen-sharing";
import ToolBar from "@/app/[locale]/(protected)/video/[roomName]/toolbar";

const VideoRoom = ({
  credentials,
  roomName,
}: {
  credentials: {
    sessionId: string;
    token: string;
    apiKey: string;
  };
  roomName: string;
}) => {
  const {
    createCall,
    room,
    participants,
    connected,
    networkStatus,
    cameraPublishing,
    localParticipant,
  } = useRoom();
  const { isScreenSharing, startScreenSharing, stopScreenSharing } =
    useScreenSharing({ room });
  const roomContainer = useRef(null);
  const effectRun = useRef(false);
  const user = useCurrentUser();

  const userName = `${user?.firstName} ${user?.lastName}`;

  useEffect(() => {
    if (!effectRun.current && credentials) {
      console.log("creating call");
      effectRun.current = true;
      createCall(credentials, roomContainer.current, userName);
    }
  }, [createCall, credentials, user, userName]);

  return (
    <div id="callContainer" className="h-screen relative bg-[#20262D] w-full">
      <div
        id="roomContainer"
        className="relative"
        style={{ height: "calc(100vh - 90px)" }}
        ref={roomContainer}
      >
        {/* <NetworkToast networkStatus={networkStatus} /> */}
        <div id="screenSharingContainer" className="absolute top-2 left-2 z-10">
          {isScreenSharing && (
            <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex justify-center items-center text-lg text-white">
              You Are Screensharing
            </div>
          )}
        </div>
      </div>
      <ToolBar
        roomName={roomName}
        room={room}
        participants={participants}
        localParticipant={localParticipant}
        connected={connected}
        cameraPublishing={cameraPublishing}
        isScreenSharing={isScreenSharing}
        startScreenSharing={startScreenSharing}
        stopScreenSharing={stopScreenSharing}
      />
    </div>
  );
};

export default VideoRoom;
