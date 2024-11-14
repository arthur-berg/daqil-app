import { formatTimeZoneWithOffset } from "@/utils/timeZoneUtils";
import { getLocale } from "next-intl/server";

const primaryColor = "#0d1a36"; // Hex color converted from HSL
const secondaryColor = "#e1eef7";

const getDaqilLogoUrl = async (locale?: string) => {
  // If this is called from a route handler we need to make sure to pass in locale as getLocale() doesn't work for route handlers
  const activeLocale = locale ? locale : await getLocale();
  return activeLocale === "en"
    ? "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-en.png"
    : "https://zakina-images.s3.eu-north-1.amazonaws.com/daqil-logo-ar.png";
};

export const twoFactorTokenTemplate = async (token: string, t: any) => {
  const daqilLogoUrl = await getDaqilLogoUrl();
  return `
  <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
    <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
      </div>
      <div style="margin-top: 40px;">
        <p>${t("message")}</p>
        <h2 style="text-align: center; font-size: 28px; color: #333333;">${token}</h2>
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
        ${t("footer")}
      </div>
    </div>
  </div>
`;
};

export const verificationEmailTemplate = async (
  t: any,
  token: string,
  locale: string,
  isTherapist?: boolean
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const encodedToken = encodeURIComponent(token);
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/new-verification?token=${encodedToken}`;

  const therapistMessage = isTherapist ? `<p>${t("therapistMessage")}</p>` : "";

  const therapistHumbly = isTherapist ? `<p>${t("therapistHumbly")}</p>` : "";

  const therapistSupportChat = isTherapist
    ? `<p>${t("therapistSupportChat")}</p>`
    : "";

  const expirationMessage = `<p>${t("expirationMessage", {
    days: 3,
  })}</p>`;

  const buttonLabel = isTherapist
    ? t("startTheJourney")
    : t("confirmEmailButton");
  const buttonColor = isTherapist ? "#28a745" : "#007bff";

  return `
  <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
    <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
      </div>
      <div style="margin-top: 40px;">
        <p>${t("welcomeMessage")}</p>
        ${therapistMessage}
        ${therapistHumbly}
        ${therapistSupportChat}


        <p>${t("confirmEmailMessage")}</p> 
        <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: ${buttonColor}; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center;">${buttonLabel}</a>
        ${expirationMessage} 
      </div>
      <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
        ${t("ignoreMessage")} 
      </div>
    </div>
  </div>
`;
};

export const passwordResetEmailTemplate = async (
  token: string,
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const encodedToken = encodeURIComponent(token);
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/new-password?token=${encodedToken}`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
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

export const appointmentCancellationTemplate = async (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    clientTimeZone: string;
    therapistTimeZone: string;
    reason: string;
    therapistName: string;
    clientName: string;
  },
  isTherapist: boolean,
  t: any,
  refundMessage: string,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/appointments`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;
  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  const timeZone = isTherapist
    ? appointmentDetails.therapistTimeZone
    : appointmentDetails.clientTimeZone;

  const formattedTimeZone = formatTimeZoneWithOffset(timeZone);

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          <p><strong>${t(
            "timeLabel"
          )}</strong> ${time} (${formattedTimeZone})</p>
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

export const invoicePaidTemplate = async (
  appointmentDetails: {
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
    therapistTimeZone?: string;
    clientTimeZone?: string;
  },
  isTherapist: boolean,
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
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
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/appointments`;

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
  const timeZone = isTherapist
    ? appointmentDetails.therapistTimeZone
    : appointmentDetails.clientTimeZone;

  const formattedTimeZone = formatTimeZoneWithOffset(timeZone as string);

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          <p><strong>${t(
            "timeLabel"
          )}</strong> ${time} (${formattedTimeZone})</p>
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

export const paidAppointmentConfirmationTemplate = async (
  appointmentDetails: {
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
    therapistTimeZone?: string;
    clientTimeZone?: string;
  },
  isTherapist: boolean,
  t: any,
  locale: string,
  isAdmin?: boolean
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/appointments`;

  const buttonText = isTherapist
    ? t("therapistButtonText")
    : t("clientButtonText");

  const additionalMessage = isTherapist
    ? t("therapistAdditionalMessage")
    : t("clientAdditionalMessage");

  // Payment details only for the client, not for the therapist
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
    : ""; // No payment details for the therapist

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;
  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  const timeZone = isTherapist
    ? appointmentDetails.therapistTimeZone
    : appointmentDetails.clientTimeZone;

  const formattedTimeZone = formatTimeZoneWithOffset(timeZone as string);

  // If admin, include both timezones
  const timeZoneInfo = isAdmin
    ? `
       <p><strong>Psychologists timezone: </strong> ${
         appointmentDetails.therapistTimeZone
           ? formatTimeZoneWithOffset(appointmentDetails.therapistTimeZone)
           : "N/A"
       }</p>
       <p><strong>Clients timezone: </strong> ${
         appointmentDetails.clientTimeZone
           ? formatTimeZoneWithOffset(appointmentDetails.clientTimeZone)
           : "N/A"
       }</p>
     `
    : `
       <p><strong>${t("timeLabel")}</strong> ${time} (${formattedTimeZone})</p>
     `;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
         <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
       
        <div style="margin-top: 40px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          ${timeZoneInfo}
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

export const introBookingConfirmationTemplate = async (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
    clientTimeZone: string;
    therapistTimeZone: string;
  },
  isTherapist: boolean,
  t: any,
  locale: string,
  isAdmin?: boolean
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;
  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  const timeZone = isTherapist
    ? appointmentDetails.therapistTimeZone
    : appointmentDetails.clientTimeZone;

  const formattedTimeZone = formatTimeZoneWithOffset(timeZone);

  const timeZoneInfo = isAdmin
    ? `
       <p><strong>Psychologists time/timeZone: </strong> ${
         appointmentDetails.therapistTime
       } (${formatTimeZoneWithOffset(appointmentDetails.therapistTimeZone)})</p>
       <p><strong>Clients time/timeZone: </strong> ${
         appointmentDetails.clientTime
       } (${formatTimeZoneWithOffset(appointmentDetails.clientTimeZone)})</p>
     `
    : `
       <p><strong>${t("timeLabel")}</strong> ${time} (${formattedTimeZone})</p>
     `;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          ${timeZoneInfo}
          <p><strong>${t("durationLabel")}</strong> ${
    appointmentDetails.durationInMinutes
  } ${t("minutesLabel")}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("thankYouMessage")}
        </div>
      </div>
    </div>
  `;
};

export const nonPaidAppointmentConfirmationTemplate = async (
  appointmentDetails: {
    date: Date;
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
    appointmentId: string;
    appointmentTypeId: string;
    therapistTimeZone: string;
    clientTimeZone: string;
  },
  isTherapist: boolean,
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const subject = isTherapist ? t("therapistSubject") : t("clientSubject");

  const appointmentsLink = isTherapist
    ? `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/therapist/appointments`
    : `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/appointments`;

  const encodedDate = encodeURIComponent(appointmentDetails.date.toString());

  const date = isTherapist
    ? appointmentDetails.therapistDate
    : appointmentDetails.clientDate;

  const time = isTherapist
    ? appointmentDetails.therapistTime
    : appointmentDetails.clientTime;

  const timeZone = isTherapist
    ? appointmentDetails.therapistTimeZone
    : appointmentDetails.clientTimeZone;

  const formattedTimeZone = formatTimeZoneWithOffset(timeZone);

  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/invoices/${appointmentDetails.appointmentId}/checkout?appointmentTypeId=${appointmentDetails.appointmentTypeId}&date=${encodedDate}`;

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
            <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${subject}</p>
          <p><strong>${t("therapistLabel")}</strong> ${
    appointmentDetails.therapistName
  }</p>
          <p><strong>${t("clientLabel")}</strong> ${
    appointmentDetails.clientName
  }</p>
          <p><strong>${t("dateLabel")}</strong> ${date}</p>
          <p><strong>${t(
            "timeLabel"
          )}</strong> ${time} (${formattedTimeZone})</p>
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

export const paymentReminderTemplate = async (
  clientFirstName: string,
  appointmentId: string,
  appointmentStartTime: string,
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/invoices/${appointmentId}/checkout?appointmentId=${appointmentId}`;

  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
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

export const reminderEmailTemplate = async (
  t: any,
  appointmentDetails: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  const formattedTimeZone = formatTimeZoneWithOffset(
    appointmentDetails.clientTimeZone
  );
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${t("greeting", { name: appointmentDetails.clientName })}</p>
          <p>${t("message", {
            therapistName: appointmentDetails.therapistName,
            date: appointmentDetails.date,
            time: appointmentDetails.time,
            timeZone: formattedTimeZone,
          })}</p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("footer")}
        </div>
      </div>
    </div>
  `;
};

export const clientNotPaidInTimeTemplate = async (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
  },
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
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

export const therapistNotPaidInTimeTemplate = async (
  appointmentDetails: {
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
  },
  t: any,
  locale: string
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
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

export const meetingLinkEmailTemplate = async ({
  hostFirstName,
  hostLastName,
  appointmentTime,
  meetingLink,
  t,
  locale,
}: {
  hostFirstName: string;
  hostLastName: string;
  appointmentTime: string;
  meetingLink: string;
  t: any;
  locale: string;
}) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);
  return `
    <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
      <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
        </div>
        <div style="margin-top: 40px;">
          <p>${t("greeting")}</p>
          <p>${t("message", {
            hostFirstName,
            hostLastName,
            appointmentTime,
          })}</p>
          <p>${t("joinLink")} <a href="${meetingLink}">${t(
    "joinMeeting"
  )}</a></p>
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">
          ${t("footer")}
        </div>
      </div>
    </div>
  `;
};

export const introBookingConfirmationEmailTemplate = async (
  appointmentDetails: any,
  confirmLink: any,
  t: any,
  locale: any
) => {
  const daqilLogoUrl = await getDaqilLogoUrl(locale);

  return {
    clientEmailHtml: `
      <div style="background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px;">
        <div style="background-color: #ffffff; padding: 20px; margin: 20px auto; max-width: 600px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${daqilLogoUrl}" alt="daqil" style="width: 50%; max-width: 100%; height: auto;" />
          </div>
          <div style="margin-top: 40px;">
            <p>${t("greeting", { name: appointmentDetails.clientName })}</p>
            <p>${t("introBookingMessage")}</p>
            <p><strong>${t("dateLabel")}</strong> ${
      appointmentDetails.clientDate
    }</p>
            <p><strong>${t("timeLabel")}</strong> ${
      appointmentDetails.clientTime
    } (${appointmentDetails.clientTimeZone})</p>
            <p><strong>${t("durationLabel")}</strong> ${
      appointmentDetails.durationInMinutes
    } ${t("minutesLabel")}</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${confirmLink}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                ${t("confirmBookingButton")}
              </a>
            </div>
            <p style="margin-top: 20px; color: #888888; font-size: 12px;">${t(
              "actionRequiredFooter"
            )}</p>
          </div>
        </div>
      </div>
    `,
  };
};
