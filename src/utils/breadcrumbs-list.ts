export const getBreadcrumbsList = (t: any) => {
  return [
    { path: "/therapist/my-clients", label: t("myClients") },
    { path: "/therapist/my-clients/[clientId]", label: t("client") },
    {
      path: "/therapist/my-clients/[clientId]/schedule-appointment",
      label: t("scheduleAppointment"),
    },
    { path: "/appointments/[id]", label: t("appontmentDetails") },
  ];
};
