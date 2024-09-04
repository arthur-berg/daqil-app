export const getBreadcrumbsList = (t: any) => {
  return [
    { path: "/therapist/clients", label: t("myClients") },
    { path: "/therapist/clients/[clientId]", label: t("client") },
    {
      path: "/therapist/clients/[clientId]/schedule-appointment",
      label: t("scheduleAppointment"),
    },
    { path: "/appointments/[id]", label: t("appontmentDetails") },
  ];
};
