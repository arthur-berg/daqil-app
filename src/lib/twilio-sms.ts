import twilio from "twilio";

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send SMS reminder using Twilio
 * @param to - The phone number to send the SMS to (client's phone number)
 * @param hostFirstName - First name of the host (therapist)
 * @param hostLastName - Last name of the host (therapist)
 * @param appointmentTime - The formatted appointment start time
 */

export const sendSmsReminder = async (
  to: string,
  hostFirstName: string,
  hostLastName: string,
  appointmentTime: string,
  t: any,
  appointmentId: string,
  noMeetingLink: string
): Promise<void> => {
  try {
    let message;

    if (noMeetingLink) {
      // Message without the meeting link
      message = t("reminderMessage24h", {
        hostFirstName,
        hostLastName,
        appointmentTime,
      });
    } else {
      // Message with the meeting link
      const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/appointments/${appointmentId}`;
      message = t("reminderMessage", {
        hostFirstName,
        hostLastName,
        appointmentTime,
        meetingLink,
      });
    }

    // Send SMS via Twilio
    await client.messages.create({
      body: message,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      to: to,
    });

    console.log(
      `SMS reminder sent to ${to} for appointment starting at ${appointmentTime}.`
    );
  } catch (error) {
    console.error("Error sending SMS reminder:", error);
    throw error;
  }
};
