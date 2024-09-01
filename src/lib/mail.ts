import mailchimp from "@mailchimp/mailchimp_transactional";
import mailchimpMarketing from "@mailchimp/mailchimp_marketing";
import { UserRole } from "@/generalTypes";
import {
  twoFactorTokenTemplate,
  verificationEmailTemplate,
  passwordResetEmailTemplate,
  appointmentCancellationTemplate,
  paidAppointmentConfirmationTemplate,
  nonPaidAppointmentConfirmationTemplate,
  invoicePaidTemplate,
  paymentReminderTemplate,
  reminderEmailTemplate,
  clientNotPaidInTimeTemplate,
  therapistNotPaidInTimeTemplate,
} from "./emailTemplates";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";

mailchimpMarketing.setConfig({
  apiKey: process.env.MAILCHIMP_MARKETING_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

const mailchimpTx = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_KEY || "");

export const addUserToSubscriberList = async (
  email: string,
  userRole?: UserRole
) => {
  // TODO: Fix the function to work correctly
  try {
    const listId =
      userRole && userRole === UserRole.THERAPIST
        ? process.env.MAILCHIMP_THERAPIST_LIST_ID
        : process.env.MAILCHIMP_LIST_ID;

    await mailchimpMarketing.lists.getListMember(listId as string, email);

    return { success: "User already exists in the list" };
  } catch (error: any) {
    if (error?.status === 404) {
      try {
        await mailchimpMarketing.lists.addListMember(
          process.env.MAILCHIMP_LIST_ID as string,
          {
            email_address: email,
            status: "subscribed",
          }
        );
        return { success: "User added to the subscriber list" };
      } catch (addError) {
        console.error("Error adding user to subscriber list", addError);
        return { error: "Failed to add user to the subscriber list" };
      }
    } else {
      console.error("Error in add user to subscriber list", error);
      return { error: "Something went wrong" };
    }
  }
};

export const addUserNameToSubscriberProfile = async (
  email: string,
  firstName: string,
  lastName: string
) => {
  try {
    const existingMember = await mailchimpMarketing.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID as string,
      email
    );

    if (existingMember.status === "subscribed") {
      console.log("User is already subscribed. Updating profile...");
      await mailchimpMarketing.lists.updateListMember(
        process.env.MAILCHIMP_LIST_ID as string,
        email,
        {
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
        }
      );
      return;
    }
  } catch (error) {
    console.error(error);
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const t = await getTranslations("TwoFactorEmail");
  const message = {
    from_email: "info@zakina-app.com",
    subject: t("subject"),
    html: twoFactorTokenTemplate(token, t),
    to: [
      {
        email,
        type: "to",
      },
    ],
  };

  try {
    await mailchimpTx.messages.send({
      message: message as any,
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string,
  password?: string,
  isTherapist?: boolean
) => {
  const t = await getTranslations("VerificationEmail");

  const message = {
    from_email: "info@zakina-app.com",
    subject: t("subject"),
    html: verificationEmailTemplate(t, token, password, isTherapist),
    to: [
      {
        email,
        type: "to",
      },
    ],
  };

  try {
    await mailchimpTx.messages.send({
      message: message as any,
    });
  } catch (error) {
    console.error("Error sending verification email: ", error);
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const t = await getTranslations("PasswordResetEmail");

  const message = {
    from_email: "info@zakina-app.com",
    subject: t("subject"),
    html: passwordResetEmailTemplate(token, t),
    to: [
      {
        email,
        type: "to",
      },
    ],
  };

  try {
    await mailchimpTx.messages.send({
      message: message as any,
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendAppointmentCancellationEmail = async (
  therapistEmail: string,
  clientEmail: string,
  appointmentDetails: {
    date: string;
    time: string;
    reason: string;
    therapistName: string;
    clientName: string;
    refundIssued?: boolean;
    refundAmount?: number;
  }
) => {
  const t = await getTranslations("AppointmentCancellationEmail");

  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: t("therapistSubject"),
    html: appointmentCancellationTemplate(appointmentDetails, true, t),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: t("clientSubject"),
    html: appointmentCancellationTemplate(appointmentDetails, false, t),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: therapistMessage as any }),
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error("Error sending appointment cancellation email:", error);
  }
};

export const sendNonPaidBookingConfirmationEmail = async (
  therapistEmail: string,
  clientEmail: string,
  appointmentDetails: {
    date: Date;
    therapistName: string;
    clientName: string;
    appointmentId: string;
    appointmentTypeId: string;
  }
) => {
  const t = await getTranslations("NonPaidAppointmentConfirmationEmail");

  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: t("therapistSubject"),
    html: nonPaidAppointmentConfirmationTemplate(appointmentDetails, true, t),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: t("clientSubject"),
    html: nonPaidAppointmentConfirmationTemplate(appointmentDetails, false, t),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: therapistMessage as any }),
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error(
      "Error sending appointment booking confirmation email:",
      error
    );
  }
};

export const sendInvoicePaidEmail = async (
  therapistEmail: string,
  clientEmail: string,
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
    amountPaid: string;
    paymentMethod: string;
    transactionId: string;
  },
  t: any
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: t("therapistSubject", {
      clientName: appointmentDetails.clientName,
    }),
    html: invoicePaidTemplate(appointmentDetails, true, t),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: t("clientSubject"),
    html: invoicePaidTemplate(appointmentDetails, false, t),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: therapistMessage as any }),
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error(
      "Error sending appointment booking confirmation email:",
      error
    );
  }
};

export const sendPaidBookingConfirmationEmail = async (
  therapistEmail: string,
  clientEmail: string,
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
    amountPaid: string;
    paymentMethod: string;
    transactionId: string;
  },
  t: any
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: t("therapistSubject"),
    html: paidAppointmentConfirmationTemplate(appointmentDetails, true, t),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: t("clientSubject"),
    html: paidAppointmentConfirmationTemplate(appointmentDetails, false, t),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: therapistMessage as any }),
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error(
      "Error sending appointment booking confirmation email:",
      error
    );
  }
};

export const sendPaymentReminderEmail = async (
  email: string,
  clientFirstName: string,
  appointmentId: string,
  appointmentStartTime: string,
  t: any
) => {
  const message = {
    from_email: "info@zakina-app.com",
    subject: t("subject"),
    html: paymentReminderTemplate(
      clientFirstName,
      appointmentId,
      appointmentStartTime,
      t
    ),
    to: [
      {
        email,
        type: "to",
      },
    ],
  };

  try {
    await mailchimpTx.messages.send({
      message: message as any,
    });
  } catch (error) {
    console.error("Error sending payment reminder email:", error);
  }
};

export const sendReminderEmail = async (
  clientEmail: string,
  appointment: any,
  t: any
) => {
  try {
    const appointmentDetails = {
      date: format(new Date(appointment.startDate), "PPPP"),
      time: format(new Date(appointment.startDate), "p"),
      therapistName: `${appointment.hostUserId.firstName} ${appointment.hostUserId.lastName}`,
      clientName: `${appointment.participants[0].userId.firstName}`,
    };

    const subject = t("subject");
    const html = reminderEmailTemplate(t, appointmentDetails);

    const message = {
      from_email: "info@zakina-app.com",
      subject: subject,
      html: html,
      to: [
        {
          email: clientEmail,
          type: "to",
        },
      ],
    };

    await mailchimpTx.messages.send({
      message: message as any,
    });
  } catch (error) {
    console.error(
      `Error sending email reminder for appointment ${appointment._id}:`,
      error
    );
  }
};

export const sendClientNotPaidInTimeEmail = async (
  clientEmail: string,
  therapistEmail: string,
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
  },
  t: any
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: t("therapistSubject"),
    html: therapistNotPaidInTimeTemplate(appointmentDetails, t),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: t("clientSubject"),
    html: clientNotPaidInTimeTemplate(appointmentDetails, t),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: therapistMessage as any }),
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error("Error sending 'not paid in time' email:", error);
  }
};
