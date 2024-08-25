import {
  scheduleJob,
  statusUpdateQueue,
  cancelUnpaidQueue,
} from "@/lib/bullmq";

// Function to schedule jobs related to an appointment
const scheduleAppointmentJobs = async (appointment) => {
  const now = new Date();
  const fifteenMinutesBeforeEnd = new Date(
    appointment.endDate.getTime() - 15 * 60 * 1000
  );
  const appointmentEndTime = new Date(appointment.endDate);

  // Schedule the status update 15 minutes before the appointment ends
  if (fifteenMinutesBeforeEnd > now) {
    await scheduleJob(
      statusUpdateQueue,
      "updateAppointmentStatus",
      { appointmentId: appointment._id },
      fifteenMinutesBeforeEnd.getTime() - now.getTime()
    );
  }

  // Schedule to cancel unpaid appointments right at the appointment end time
  if (appointmentEndTime > now) {
    await scheduleJob(
      cancelUnpaidQueue,
      "cancelUnpaidAppointments",
      { appointmentId: appointment._id },
      appointmentEndTime.getTime() - now.getTime()
    );
  }
};

export default scheduleAppointmentJobs;
