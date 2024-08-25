import { sendReminderEmail } from "@/lib/mail";
import Appointment from "@/models/Appointment";

export const checkAndUpdateAppointmentStatus = async (
  appointmentId: string
) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    const { hostShowUp, participants, endDate, status } = appointment;

    // Only process if the appointment is not already completed or canceled
    if (status === "completed" || status === "canceled") {
      console.log(`Appointment ${appointmentId} is already processed.`);
      return;
    }

    // Check if the endDate is in the past
    const now = new Date();
    if (endDate > now) {
      console.log(`Appointment ${appointmentId} has not ended yet.`);
      return;
    }

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
  } catch (error) {
    console.error(
      `Error updating appointment status for ${appointmentId}:`,
      error
    );
  }
};

export const checkAndCancelUnpaidAppointment = async (
  appointmentId: string
) => {
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    const { payment, status } = appointment;

    // Only process if the appointment is not already canceled or completed
    if (status === "canceled" || status === "completed") {
      console.log(`Appointment ${appointmentId} is already processed.`);
      return;
    }

    // Check if the payment deadline has passed
    const now = new Date();
    if (payment.paymentExpiryDate > now) {
      console.log(
        `Payment deadline for appointment ${appointmentId} has not passed yet.`
      );
      return;
    }

    if (payment.status === "pending") {
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
    } else {
      console.log(`Appointment ${appointmentId} has already been paid.`);
    }
  } catch (error) {
    console.error(
      `Error cancelling unpaid appointment ${appointmentId}:`,
      error
    );
  }
};

export const sendEmailReminder = async (
  clientEmail: string,
  appointmentId: string
) => {
  try {
    // Fetch appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    await sendReminderEmail(clientEmail, appointmentId);

    console.log(
      `Email reminder sent to ${clientEmail} for appointment ${appointmentId}.`
    );
  } catch (error) {
    console.error(
      `Error sending email reminder for appointment ${appointmentId}:`,
      error
    );
  }
};

export const sendSmsReminder = async (
  clientPhone: string,
  appointmentId: string
) => {
  try {
    // Fetch appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    // SMS content
    const message = `Reminder: You have an appointment on ${appointment.startDate.toDateString()} at ${appointment.startDate.toLocaleTimeString()}. Please be available.`;

    // Send the SMS
    await sendSms(clientPhone, message);
    console.log(
      `SMS reminder sent to ${clientPhone} for appointment ${appointmentId}.`
    );
  } catch (error) {
    console.error(
      `Error sending SMS reminder for appointment ${appointmentId}:`,
      error
    );
  }
};

export const sendPaymentReminder = async (
  clientEmail: string,
  appointmentId: string
) => {
  try {
    // Fetch appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    const { payment } = appointment;

    await sendReminderEmail(clientEmail, appointmentId);

    console.log(
      `Payment reminder sent to ${clientEmail} for appointment ${appointmentId}.`
    );
  } catch (error) {
    console.error(
      `Error sending payment reminder for appointment ${appointmentId}:`,
      error
    );
  }
};
