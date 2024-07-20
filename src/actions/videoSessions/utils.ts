export const isUserAuthorized = async (
  session: any,
  isTherapist: boolean,
  isClient: boolean,
  userId?: string
) => {
  if (isTherapist) {
    const isAuthorizedTherapist = isTherapist && session.hostUserId === userId;
    return isAuthorizedTherapist;
  }

  if (isClient) {
    const isAuthorizedPatient = getClient(session, userId);
    return isAuthorizedPatient;
  }

  return false;
};

export const getClient = (session: any, userId?: string) => {
  const patient = session.participants.find(
    (participant: any) => participant.userId === userId
  );

  return patient;
};
