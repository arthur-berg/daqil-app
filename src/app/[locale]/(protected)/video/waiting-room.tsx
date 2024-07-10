"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@/navigation";

const WaitingRoom = () => {
  const user = useCurrentUser();

  /* const roomToJoin = location?.state?.room || ""; */

  //roomToJoin

  if (!user) return;

  const roomName = `Video session with Dr ${user.firstName}`;

  return (
    <Link href={`/video/${encodeURIComponent(roomName)}`}>
      <Button>Create meeting</Button>
    </Link>
  );
};

export default WaitingRoom;
