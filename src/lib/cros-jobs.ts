import Appointment from "@/models/Appointment";

const BATCH_SIZE = 1000; // Adjust batch size based on your system's capacity

export const checkAndUpdateAppointmentStatuses = async () => {
  const now = new Date();
  let processedCount = 0;

  while (true) {
    // Find a batch of appointments that need their status checked
    const appointments = await Appointment.find({
      endDate: { $lt: now },
      status: { $nin: ["completed", "canceled"] }, // Exclude already processed appointments
    })
      .limit(BATCH_SIZE)
      .skip(processedCount);

    if (appointments.length === 0) break;

    for (const appointment of appointments) {
      const { _id: appointmentId, hostShowUp, participants } = appointment;

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
      console.log(
        `Appointment ${appointmentId} status updated to ${updatePayload.status}`
      );
    }

    processedCount += appointments.length;
  }
};

export const checkAndCancelUnpaidAppointments = async () => {
  const now = new Date();
  let processedCount = 0;

  while (true) {
    // Find a batch of appointments that are unpaid and should have been paid by now
    const unpaidAppointments = await Appointment.find({
      "payment.paymentExpiryDate": { $lt: now },
      "payment.status": "pending",
      status: { $nin: ["canceled", "completed"] },
    })
      .limit(BATCH_SIZE)
      .skip(processedCount);

    if (unpaidAppointments.length === 0) break;

    for (const appointment of unpaidAppointments) {
      const { _id: appointmentId, status } = appointment;

      // Update the status to canceled
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        {
          status: "canceled",
          cancellationReason: "Appointment was not paid in time",
        },
        { new: true }
      ); // Return the updated document

      console.log(
        `Appointment ${updatedAppointment._id} changed status to ${updatedAppointment.status} due to 'Appointment was not paid in time'`
      );
    }

    processedCount += unpaidAppointments.length;
  }
};
