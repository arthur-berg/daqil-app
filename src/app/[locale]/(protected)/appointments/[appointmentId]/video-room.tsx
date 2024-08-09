"use client";

import { useEffect, useRef, useState } from "react";
import useRoom from "@/hooks/use-room";
import { useCurrentUser } from "@/hooks/use-current-user";
import useScreenSharing from "@/hooks/use-screen-sharing";
import ToolBar from "@/app/[locale]/(protected)/appointments/[appointmentId]/toolbar";

const VideoRoom = ({
  sessionData,
}: {
  sessionData: {
    sessionId?: string;
    token?: string;
    appId?: string;
    roomName: string;
  };
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
  const roomContainer = useRef<any>(null);
  const effectRun = useRef(false);
  const user = useCurrentUser();

  const userName = `${user?.firstName} ${user?.lastName}`;

  useEffect(() => {
    if (!effectRun.current && sessionData) {
      effectRun.current = true;
      const credentials = {
        appId: sessionData.appId,
        sessionId: sessionData.sessionId,
        token: sessionData.token,
      } as any;
      createCall(credentials, roomContainer.current, userName);
    }

    return () => {
      if (room) {
        room.leave();
      }
    };
  }, [createCall, sessionData, user, userName, room]);

  return (
    <div className="h-screen w-full flex flex-col p-4 box-border">
      <div
        id="callContainer"
        className="flex flex-col flex-grow w-full overflow-hidden"
      >
        <div
          id="roomContainer"
          className="flex-grow bg-[#20262D] overflow-hidden"
          ref={roomContainer}
        >
          <div
            id="screenSharingContainer"
            className="absolute top-2 left-2 z-10 p-y"
          >
            {isScreenSharing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 z-10 flex justify-center items-center text-lg text-white">
                You Are Screensharing
              </div>
            )}
          </div>
        </div>
        <ToolBar
          roomName={sessionData.roomName}
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
    </div>
  );
};

export default VideoRoom;
