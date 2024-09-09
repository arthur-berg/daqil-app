import { format } from "date-fns";

const primaryColor = "#0d1a36"; // Hex color converted from HSL
const secondaryColor = "#e1eef7";

export const twoFactorTokenTemplate = (token: string, t: any) => `
  <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
    <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
  "daqil"
)}</h1>
      </div>
      <div style="margin-top: 20px;">
        <p>${t("message")}</p>
        <h2 style="text-align: center; font-size: 28px; color: #333333;">${token}</h2>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
        ${t("footer")}
      </div>
    </div>
  </div>
`;

export const verificationEmailTemplate = (
  t: any,
  token: string,
  password?: string,
  isTherapist?: boolean
) => {
  const encodedToken = encodeURIComponent(token);
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${encodedToken}`;
  const temporaryPasswordMessage = password
    ? `<p>${t("temporaryPasswordMessage", {
        password: `<strong>${password}</strong>`,
      })}</p>`
    : "";

  const therapistMessage = isTherapist ? `<p>${t("therapistMessage")}</p>` : "";

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("welcomeMessage")}</p>
          ${therapistMessage}
          ${temporaryPasswordMessage}
          
          <p>${t("confirmEmailMessage")}</p> 
          <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">${t(
    "confirmEmailButton"
  )}</a> 
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("ignoreMessage")} 
        </div>
      </div>
    </div>
  `;
};

export const passwordResetEmailTemplate = (token: string, t: any) => {
  const encodedToken = encodeURIComponent(token);
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-password?token=${encodedToken}`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("resetMessage")}</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">${t(
    "resetButton"
  )}</a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("ignoreMessage")} 
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
  isTherapist: boolean,
  t: any,
  refundMessage: string
) => {
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/appointments`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${appointmentDetails.date}</p>
          <p><strong>${t("timeLabel")}</strong> ${appointmentDetails.time}</p>
          <p><strong>${t("reasonLabel")}</strong> ${
    appointmentDetails.reason
  }</p>
          ${refundMessage ? `<p><strong>${refundMessage}</strong></p>` : ""}
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
        </div>
      </div>
    </div>
  `;
};

export const invoicePaidTemplate = (
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
    amountPaid?: string;
    paymentMethod?: string;
    transactionId?: string;
    therapistDate?: string;
    therapistTime?: string;
    clientDate?: string;
    clientTime?: string;
  },
  isTherapist: boolean,
  t: any
) => {
  const subject = isTherapist
    ? t("therapistSubject", { clientName: appointmentDetails.clientName })
    : t("clientSubject");

  const additionalMessage = isTherapist
    ? t("therapistAdditionalMessage", {
        clientName: appointmentDetails.clientName,
      })
    : t("clientAdditionalMessage", {
        therapistName: appointmentDetails.therapistName,
      });

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/appointments`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  const paymentDetails = !isTherapist
    ? `
      <div style="margin-top: 20px;">
        <h3 style="color: ${primaryColor};">${t("paymentDetailsTitle")}</h3>
        <p><strong>${t("amountPaidLabel")}</strong> ${
        appointmentDetails.amountPaid
      }</p>
        <p><strong>${t("paymentMethodLabel")}</strong> ${
        appointmentDetails.paymentMethod
      }</p>
        <p><strong>${t("transactionIdLabel")}</strong> ${
        appointmentDetails.transactionId
      }</p>
      </div>
    `
    : "";

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;
  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          <p><strong>${t("timeLabel")}</strong> ${time}</p>
          <p><strong>${t("durationLabel")}</strong> ${
    appointmentDetails.durationInMinutes
  } ${t("minutesLabel")}</p>
        </div>
        ${paymentDetails}
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${additionalMessage}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
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
    amountPaid?: string;
    paymentMethod?: string;
    transactionId?: string;
    clientDate?: string;
    clientTime?: string;
    therapistDate?: string;
    therapistTime?: string;
  },
  isTherapist: boolean,
  t: any
) => {
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/appointments`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  const additionalMessage = isTherapist
    ? t("therapistAdditionalMessage")
    : t("clientAdditionalMessage");

  const paymentDetails = !isTherapist
    ? `
      <div style="margin-top: 20px;">
        <h3 style="color: ${primaryColor};">${t("paymentDetailsTitle")}</h3>
        <p><strong>${t("amountPaidLabel")}</strong> ${
        appointmentDetails.amountPaid
      }</p>
        <p><strong>${t("paymentMethodLabel")}</strong> ${
        appointmentDetails.paymentMethod
      }</p>
        <p><strong>${t("transactionIdLabel")}</strong> ${
        appointmentDetails.transactionId
      }</p>
      </div>
    `
    : "";

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;
  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          <p><strong>${t("timeLabel")}</strong> ${time}</p>
          <p><strong>${t("durationLabel")}</strong> ${
    appointmentDetails.durationInMinutes
  } ${t("minutesLabel")}</p>
        </div>
        ${paymentDetails}
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${additionalMessage}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
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
  isTherapist: boolean,
  t: any
) => {
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/appointments`;

  const encodedDate = encodeURIComponent(appointmentDetails.date.toString());
  const formattedDate = format(new Date(appointmentDetails.date), "yyyy-MM-dd");
  const formattedTime = format(new Date(appointmentDetails.date), "HH:mm");

  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${appointmentDetails.appointmentId}/checkout?appointmentId=${appointmentDetails.appointmentId}&appointmentTypeId=${appointmentDetails.appointmentTypeId}&date=${encodedDate}`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  const additionalMessage = isTherapist
    ? t("therapistAdditionalMessage")
    : t("clientAdditionalMessage");

  const payNowButton = !isTherapist
    ? `
      <div style="text-align: center; margin-top: 20px;">
        <a href="${paymentLink}" style="display: inline-block; padding: 12px 24px; margin-right: 10px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
          ${t("payNowButtonText")}
        </a>
      </div>
    `
    : "";

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${formattedDate}</p>
          <p><strong>${t("timeLabel")}</strong> ${formattedTime}</p>
        </div>
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${additionalMessage}</p>
        </div>
        ${payNowButton}
        <div style="text-align: center; margin-top: 10px;">
          <a href="${appointmentsLink}" style="display: inline-block; padding: 12px 24px; background-color: ${secondaryColor}; color: #000000; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${buttonText}
          </a>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
        </div>
      </div>
    </div>
  `;
};

export const paymentReminderTemplate = (
  clientFirstName: string,
  appointmentId: string,
  appointmentStartTime: string,
  t: any // Accept the translation function
) => {
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${appointmentId}/checkout?appointmentId=${appointmentId}`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "companyName"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("greeting", { clientFirstName })}</p>
          <p>${t("reminderText", { appointmentStartTime })}</p>
          <p>${t("paymentInstructions")}</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${paymentLink}" style="display: inline-block; padding: 12px 24px; margin-right: 10px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
              ${t("payNowButton")}
            </a>
          </div>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("footerText")}
        </div>
      </div>
    </div>
  `;
};

export const reminderEmailTemplate = (t: any, appointmentDetails: any) => {
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0073e6; font-size: 24px; margin: 0;">${t(
            "daqil"
          )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("greeting", { name: appointmentDetails.clientName })}</p>
          <p>${t("message", {
            therapistName: appointmentDetails.therapistName,
            date: appointmentDetails.date,
            time: appointmentDetails.time,
          })}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("footer")}
        </div>
      </div>
    </div>
  `;
};

export const clientNotPaidInTimeTemplate = (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
  },
  t: any
) => {
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("clientSubject")}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${
    appointmentDetails.clientDate
  }</p>
          <p><strong>${t("timeLabel")}</strong> ${
    appointmentDetails.clientTime
  }</p>
        </div>
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${t("notPaidInTimeMessageClient")}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
        </div>
      </div>
    </div>
  `;
};

export const therapistNotPaidInTimeTemplate = (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
  },
  t: any
) => {
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0;">${t(
    "daqil"
  )}</h1>
        </div>
        <div style="margin-top: 20px;">
          <p>${t("therapistSubject")}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${
    appointmentDetails.therapistDate
  }</p>
          <p><strong>${t("timeLabel")}</strong> ${
    appointmentDetails.therapistTime
  }</p>
        </div>
        <div style="margin-top: 20px; font-size: 16px; color: #333333;">
          <p>${t("notPaidInTimeMessageTherapist")}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
        </div>
      </div>
    </div>
  `;
};
