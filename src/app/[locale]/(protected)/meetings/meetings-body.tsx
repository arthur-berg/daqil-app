import { getMeetings } from "@/actions/meetings";
import MeetingsList from "@/app/[locale]/(protected)/meetings/meetings-list";

const MeetingsBody = async () => {
  const meetings = await getMeetings();
  return <MeetingsList meetings={meetings} />;
};

export default MeetingsBody;
