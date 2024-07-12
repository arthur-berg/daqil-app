export const getTokenExpiresAt = async (
  session: any,
  isTherapist: boolean,
  userId?: string
) => {
  if (isTherapist) {
    return session.hostTokenExpiresAt;
  }

  const patient = session.participants.find(
    (participant: any) => participant.id === userId
  );

  return patient.tokenExpiresAt;
};

export const getSavedToken = async (
  session: any,
  isTherapist: boolean,
  userId?: string
) => {
  if (isTherapist) {
    return session.hostToken;
  }

  const patient = session.participants.find(
    (participant: any) => participant.id === userId
  );

  return patient.token;
};

export const getUpdatePayload = (
  data: any,
  isTherapist: boolean,
  userId?: string
) => {
  if (isTherapist) {
    return {
      token: data.token,
      hostTokenExpiresAt: data.expiresAt,
    };
  }

  return {
    participants: [
      {
        userId: userId,
        token: data.token,
        tokenExpiresAt: data.expiresAt,
      },
    ],
  };
};

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
      hostId: appointment.therapistId,
      hostToken: data?.token,
      hostTokenExpiresAt: data?.expiresAt,
      participants: [
        {
          userId: appointment.patientId,
        },
      ],
    };
  }

  return {
    sessionId: data?.sessionId,
    roomName: appointment.title,
    appointmentId: appointment._id,
    participants: [
      {
        userId: appointment.patientId,
        token: data?.token,
        tokenExpiresAt: data?.expiresAt,
      },
    ],
  };
};

export const isUserAuthorized = async (
  session: any,
  isTherapist: boolean,
  isPatient: boolean,
  userId?: string
) => {
  if (isTherapist) {
    const isAuthorizedTherapist = isTherapist && session.hostId === userId;
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
