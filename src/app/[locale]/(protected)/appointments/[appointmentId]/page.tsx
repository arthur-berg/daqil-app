import { getSessionData } from "@/actions/videoSessions/actions";
import VideoRoom from "@/app/[locale]/(protected)/appointments/[appointmentId]/video-room";
import {
  APPOINTMENT_TYPE_ID_LONG_SESSION,
  APPOINTMENT_TYPE_ID_SHORT_SESSION,
} from "@/contants/config";
import { getAppointmentTypesByIDs } from "@/data/appointment-types";

const AppointmentSessionPage = async ({
  params,
  searchParams,
}: {
  params: { appointmentId: string };
  searchParams: { disablePreview?: string };
}) => {
  const sessionData = await getSessionData(params.appointmentId);

  if (!sessionData) return;

  const { disablePreview } = searchParams;

  const appointmentTypes = await getAppointmentTypesByIDs([
    APPOINTMENT_TYPE_ID_SHORT_SESSION,
    APPOINTMENT_TYPE_ID_LONG_SESSION,
  ]);

  return (
    <div>
      <VideoRoom
        sessionData={sessionData}
        disablePreview={!!disablePreview}
        appointmentTypes={appointmentTypes}
      />
    </div>
  );
};

export default AppointmentSessionPage;
