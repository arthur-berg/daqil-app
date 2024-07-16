export const getCreatePayload = (
  data: any,
  isTherapist: boolean,
  appointment: any
) => {
  if (isTherapist) {
    return {
      sessionId: data?.sessionId,
      roomName: appointment.title,
      appointmentId: appointment._id,
      hostUserId: appointment.hostUserId,
      hostToken: data?.token,
      hostTokenExpiresAt: data?.expiresAt,
      participants: appointment.participants,
    };
  }

  return {
    sessionId: data?.sessionId,
    roomName: appointment.title,
    appointmentId: appointment._id,
    participants: appointment.participants,
  };
};

export const isUserAuthorized = async (
  session: any,
  isTherapist: boolean,
  isPatient: boolean,
  userId?: string
) => {
  if (isTherapist) {
    const isAuthorizedTherapist = isTherapist && session.hostUserId === userId;
    return isAuthorizedTherapist;
  }

  if (isPatient) {
    const isAuthorizedPatient = isPatient && getPatient(session, userId);
    return isAuthorizedPatient;
  }

  return false;
};

export const getPatient = (session: any, userId?: string) => {
  const patient = session.participants.find(
    (participant: any) => participant.id === userId
  );

  return patient;
};
