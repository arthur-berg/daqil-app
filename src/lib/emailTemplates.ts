import { format } from "date-fns";

const primaryColor = "#0d1a36"; // Hex color converted from HSL
const secondaryColor = "#e1eef7";

export const twoFactorTokenTemplate = (token: string) => `
  <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
    <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
      </div>
      <div style="margin-top: 20px;">
        <p>Your Two-Factor Authentication (2FA) code is:</p>
        <h2 style="text-align: center; font-size: 28px; color: #333333;">${token}</h2>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
        If you did not request this, please ignore this email.
      </div>
    </div>
  </div>
`;

export const verificationEmailTemplate = (
  token: string,
  password?: string,
  isTherapist?: boolean
) => {
  const encodedToken = encodeURIComponent(token);
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${encodedToken}`;
  const temporaryPasswordMessage = password
    ? `<p>Here is your temporary password: <strong>${password}</strong></p>`
    : "";

  const therapistMessage = isTherapist
    ? `<p>You have been invited to Zakina as a therapist</p>`
    : "";

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>Welcome to Zakina!</p>
          ${therapistMessage}
          ${temporaryPasswordMessage}
          
          <p>Please confirm your email address to complete the registration process.</p>
          <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">Confirm Email</a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          If you did not sign up for this account, please ignore this email.
        </div>
      </div>
    </div>
  `;
};

export const passwordResetEmailTemplate = (token: string) => {
  const encodedToken = encodeURIComponent(token);
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${encodedToken}`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>We received a request to reset your password. You can do so by clicking the button below:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">Reset Password</a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          If you did not request a password reset, please ignore this email.
        </div>
      </div>
    </div>
  `;
};

export const appointmentCancellationTemplate = (
  appointmentDetails: {
    date: string;
    time: string;
    reason: string;
    therapistName: string;
    clientName: string;
  },
  isTherapist: boolean
) => {
  const subject = isTherapist
    ? "Appointment Canceled by Client"
    : "Your Appointment has been Canceled";

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/client/appointments`;

  const buttonText = isTherapist
    ? "See all my appointments"
    : "View my appointments";

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>Therapist:</strong> ${appointmentDetails.therapistName}</p>
          <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
          <p><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          <p><strong>Reason:</strong> ${appointmentDetails.reason}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          Thank you for using Zakina.
        </div>
      </div>
    </div>
  `;
};

export const paidAppointmentConfirmationTemplate = (
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
  },
  isTherapist: boolean
) => {
  const subject = isTherapist
    ? "New Appointment Booking"
    : "Appointment Confirmation";

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/client/appointments`;

  const buttonText = isTherapist
    ? "See all my appointments"
    : "View my appointments";

  const additionalMessage = isTherapist
    ? "To join the session and manage all your appointments, please visit your appointments page."
    : "You can join your upcoming session and see an overview of all your appointments on your appointments page.";

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>Therapist:</strong> ${appointmentDetails.therapistName}</p>
          <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
          <p><strong>Date:</strong> ${appointmentDetails.date}</p>
          <p><strong>Time:</strong> ${appointmentDetails.time}</p>
          <p><strong>Duration:</strong> ${appointmentDetails.durationInMinutes}</p>
        </div>
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${additionalMessage}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          Thank you for using Zakina.
        </div>
      </div>
    </div>
  `;
};

export const nonPaidAppointmentConfirmationTemplate = (
  appointmentDetails: {
    date: Date;
    therapistName: string;
    clientName: string;
    appointmentId: string;
    appointmentTypeId: string;
  },
  isTherapist: boolean
) => {
  const subject = isTherapist
    ? "New Appointment Booking"
    : "Appointment Confirmation";

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/client/appointments`;

  // Encode the date to ensure it's safely included in the URL
  const encodedDate = encodeURIComponent(appointmentDetails.date.toString());
  const formattedDate = format(new Date(appointmentDetails.date), "yyyy-MM-dd");
  const formattedTime = format(new Date(appointmentDetails.date), "HH:mm");

  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${appointmentDetails.appointmentId}/checkout?appointmentId=${appointmentDetails.appointmentId}&appointmentTypeId=${appointmentDetails.appointmentTypeId}&date=${encodedDate}`;

  const buttonText = isTherapist
    ? "See all my appointments"
    : "View my appointments";

  const additionalMessage = isTherapist
    ? "To join the session and manage all your appointments, please visit your appointments page."
    : `Please note that this appointment needs to be paid for at least 1 hour before the meeting starts. You can make the payment using the link below. You can also join your upcoming session and see an overview of all your appointments on your appointments page.`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">Zakina</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>Therapist:</strong> ${appointmentDetails.therapistName}</p>
          <p><strong>Client:</strong> ${appointmentDetails.clientName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
        </div>
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${additionalMessage}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${paymentLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Pay Now
          </a>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${secondaryColor}; color: #000000; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          Thank you for using Zakina.
        </div>
      </div>
    </div>
  `;
};
