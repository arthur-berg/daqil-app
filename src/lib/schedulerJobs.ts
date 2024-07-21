import Appointment from "@/models/Appointment";
import schedule from "node-schedule";

export const scheduleJobToCheckAppointmentStatus = (
  appointmentId: string,
  endDate: Date
) => {
  const now = new Date();

  if (endDate < now) {
    // If the endDate is in the past, run the job immediately
    updateAppointmentStatus(appointmentId);
  } else {
    // Schedule the job for future endDates
    schedule.scheduleJob(endDate, async () => {
      await updateAppointmentStatus(appointmentId);
    });
  }
};

const updateAppointmentStatus = async (appointmentId: string) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return;
  }

  let newStatus = "completed";
  const { hostShowUp, participants } = appointment;

  const allParticipantsShowedUp = participants.every(
    (participant: any) => participant.showUp
  );

  if (!hostShowUp && !allParticipantsShowedUp) {
    newStatus = "no-show-both";
  } else if (!hostShowUp) {
    newStatus = "no-show-host";
  } else if (!allParticipantsShowedUp) {
    newStatus = "no-show-participant";
  }

  appointment.status = newStatus;

  await Appointment.findByIdAndUpdate(appointmentId, {
    status: newStatus,
  });
};
