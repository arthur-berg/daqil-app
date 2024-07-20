import Appointment from "@/models/Appointment";
import schedule from "node-schedule";

export const scheduleJobToCheckAppointmentStatus = (
  appointmentId: string,
  endDate: Date
) => {
  schedule.scheduleJob(endDate, async () => {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.error("Appointment not found");
      return;
    }

    const allParticipantsShowUp = appointment.participants.every(
      (p: any) => p.showUp
    );
    if (appointment.hostShowUp && allParticipantsShowUp) {
      appointment.status = "completed";
    } else if (!allParticipantsShowUp) {
      appointment.status = "no-show";
    }
    await appointment.save();
  });
};
