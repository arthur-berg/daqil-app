"use client";

import { scheduleMeeting } from "@/actions/meetings";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@/navigation";
import { useTransition } from "react";

const VideoRoomsList = () => {
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  /* const roomToJoin = location?.state?.room || ""; */

  //roomToJoin

  if (!user) return;

  const roomName = `Video session with Dr ${user.firstName}`;
  const handleScheduleMeeting = () => {
    startTransition(async () => {
      await scheduleMeeting();
    });
  };

  // Create session here and send sessionId in params instead of roomName?
  // roomName can be created when session is created from the hosting and participant users name

  return (
    <>
      <Button onClick={() => handleScheduleMeeting()}>
        Schedule meeting with your patient Johanna
      </Button>
      <Button>Schedule meeting with your patient Eric</Button>
      <Button>Schedule meeting with your patient Eric</Button>

      <div></div>
      <Link href={`/video/${encodeURIComponent(roomName)}`}>
        <Button>Join meeting</Button>
      </Link>
    </>
  );
};

export default VideoRoomsList;
