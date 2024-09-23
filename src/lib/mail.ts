import { getFirstName, getFullName } from "./../utils/formatName";
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
  const roleTag =
    userRole === UserRole.THERAPIST
      ? process.env.MAILCHIMP_THERAPIST_TAG
      : process.env.MAILCHIMP_CLIENT_TAG;

  try {
    const listResponse = await mailchimpMarketing.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID as string,
      email
    );

    if (listResponse.status === "subscribed") {
      return { success: "User already exists in the list" };
    } else if (
      listResponse.status === "archived" ||
      listResponse.status === "unsubscribed" ||
      listResponse.status === "cleaned"
    ) {
      try {
        await mailchimpMarketing.lists.updateListMember(
          process.env.MAILCHIMP_LIST_ID as string,
          email,
          {
            status: "subscribed",
          }
        );

        await mailchimpMarketing.lists.updateListMemberTags(
          process.env.MAILCHIMP_LIST_ID as string,
          email,
          {
            tags: [
              {
                name: roleTag as string,
                status: "active",
              },
            ],
          }
        );

        return { success: "User re-subscribed to the list" };
      } catch (updateError) {
        console.error("Error re-subscribing user to the list", updateError);
        return { error: "Failed to re-subscribe user to the list" };
      }
    }

    return { error: "Unexpected user status, unable to subscribe" };
  } catch (error: any) {
    if (error?.status === 404) {
      // User does not exist, add them to the list
      try {
        await mailchimpMarketing.lists.addListMember(
          process.env.MAILCHIMP_LIST_ID as string,
          {
            email_address: email,
            status: "subscribed",
            tags: [roleTag as string],
          }
        );
        return { success: "User added to the subscriber list" };
      } catch (addError: any) {
        // Check for permanent deletion error
        if (
          addError?.response?.body?.detail?.includes("was permanently deleted")
        ) {
          console.error(
            "User was permanently deleted and cannot be re-imported",
            addError
          );
          return {
            error:
              "User was permanently deleted and must re-subscribe manually.",
          };
        }

        console.error("Error adding user to subscriber list", addError);
        return { error: "Failed to add user to the subscriber list" };
      }
    } else {
      // Handle other errors
      console.error("Error in add user to subscriber list", error);
      return { error: "Something went wrong" };
    }
  }
};

export const addUserNameToSubscriberProfile = async (
  email: string,
  firstName: { en: string; ar?: string },
  lastName: { en: string; ar?: string }
) => {
  try {
    const existingMember = await mailchimpMarketing.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID as string,
      email
    );

    if (existingMember.status === "subscribed") {
      console.log("User is already subscribed. Updating profile...");

      const updateData = {
        merge_fields: {
          FNAME_EN: firstName.en,
          LNAME_EN: lastName.en,
          FNAME_AR: firstName.ar || firstName.en,
          LNAME_AR: lastName.ar || lastName.en,
        },
      };

      // Update the member's profile in Mailchimp
      await mailchimpMarketing.lists.updateListMember(
        process.env.MAILCHIMP_LIST_ID as string,
        email,
        updateData
      );

      return;
    }
  } catch (error) {
    console.error("Error updating Mailchimp member:", error);
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const t = await getTranslations("TwoFactorEmail");
  const message = {
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    reason: string;
    therapistName: string;
    clientName: string;
    refundIssued: boolean;
    refundAmount: number;
  }
) => {
  const t = await getTranslations("AppointmentCancellationEmail");

  const refundMessage = appointmentDetails.refundIssued
    ? `${t("refundLabel")}: $${appointmentDetails.refundAmount}`
    : "";

  const therapistMessage = {
    from_email: "no-reply@daqil.com",
    subject: t("therapistSubject"),
    html: appointmentCancellationTemplate(
      appointmentDetails,
      true,
      t,
      refundMessage
    ),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqil.com",
    subject: t("clientSubject"),
    html: appointmentCancellationTemplate(
      appointmentDetails,
      false,
      t,
      refundMessage
    ),
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
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
    therapistName: string;
    clientName: string;
    appointmentId: string;
    appointmentTypeId: string;
  }
) => {
  const t = await getTranslations("NonPaidAppointmentConfirmationEmail");
  const therapistMessage = {
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
    therapistName: string;
    clientName: string;
    durationInMinutes: number;
    amountPaid: string;
    paymentMethod: string;
    transactionId: string;
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
  },
  t: any
) => {
  const therapistMessage = {
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
    clientDate: string;
    clientTime: string;
    therapistDate: string;
    therapistTime: string;
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
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
  appointmentDetails: {
    date: string;
    time: string;
    therapistName: string;
    clientName: string;
  },
  t: any
) => {
  try {
    const subject = t("subject");
    const html = reminderEmailTemplate(t, appointmentDetails);

    const message = {
      from_email: "no-reply@daqil.com",
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
    console.error(`Error sending email reminder:`, error);
  }
};

export const sendClientNotPaidInTimeEmail = async (
  clientEmail: string,
  therapistEmail: string,
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
  const therapistMessage = {
    from_email: "no-reply@daqil.com",
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
    from_email: "no-reply@daqil.com",
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
