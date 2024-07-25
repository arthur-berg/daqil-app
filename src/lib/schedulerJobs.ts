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

  const { hostShowUp, participants } = appointment;

  const allParticipantsShowedUp = participants.every(
    (participant: any) => participant.showUp
  );

  let updatePayload: Record<string, unknown> = { status: "completed" };

  if (!hostShowUp && !allParticipantsShowedUp) {
    updatePayload = {
      status: "canceled",
      cancellationReason: "no-show-both",
    };
  } else if (!hostShowUp) {
    updatePayload = {
      status: "canceled",
      cancellationReason: "no-show-host",
    };
  } else if (!allParticipantsShowedUp) {
    updatePayload = {
      status: "canceled",
      cancellationReason: "no-show-participant",
    };
  }

  await Appointment.findByIdAndUpdate(appointmentId, updatePayload);
};
