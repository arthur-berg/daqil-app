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
  appointmentTime: string
): Promise<void> => {
  try {
    const message = `Reminder: Your appointment with ${hostFirstName} ${hostLastName} starts in 30 minutes at ${appointmentTime}. Please be ready and ensure your microphone and video are working properly.`;

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
