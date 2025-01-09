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
  introBookingConfirmationTemplate,
  meetingLinkEmailTemplate,
  introBookingConfirmationEmailTemplate,
} from "./emailTemplates";
import { getLocale, getTranslations } from "next-intl/server";

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

        /*  await mailchimpMarketing.lists.updateListMemberTags(
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
        ); */

        return { success: "User re-subscribed to the list" };
      } catch (updateError) {
        console.error("Error re-subscribing user to the list", updateError);
        return { error: "Failed to re-subscribe user to the list" };
      }
    }

    return { error: "Unexpected user status, unable to subscribe" };
  } catch (error: any) {
    if (error?.status === 404) {
      const creationDate = new Date().toISOString();

      try {
        await mailchimpMarketing.lists.addListMember(
          process.env.MAILCHIMP_LIST_ID as string,
          {
            email_address: email,
            status: "subscribed",
            /*   tags: [roleTag as string], */
            merge_fields: {
              CREATEDAT: creationDate,
            },
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

export const addTagToMailchimpUser = async (email: string, tag: string) => {
  try {
    await mailchimpMarketing.lists.updateListMemberTags(
      process.env.MAILCHIMP_LIST_ID as string,
      email,
      {
        tags: [
          {
            name: tag,
            status: "active",
          },
        ],
      }
    );
    console.log(`Tag "${tag}" added to Mailchimp user: ${email}`);
    return { success: `Tag "${tag}" added successfully` };
  } catch (error: any) {
    console.error("Error adding tag to Mailchimp user:", error);
    return { error: `Failed to add tag "${tag}" to Mailchimp user: ${email}` };
  }
};

export const setCustomFieldsForMailchimpUser = async (
  email: string,
  customFields: { [key: string]: any }
) => {
  try {
    await mailchimpMarketing.lists.setListMember(
      process.env.MAILCHIMP_LIST_ID as string,
      email,
      {
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: customFields,
      }
    );

    console.log(`Custom fields updated for Mailchimp user: ${email}`);
    return { success: `Custom fields updated successfully` };
  } catch (error) {
    console.error("Error updating custom fields for Mailchimp user:", error);
    return { error: "Failed to update custom fields for Mailchimp user" };
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const t = await getTranslations("TwoFactorEmail");
  const message = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("subject"),
    html: await twoFactorTokenTemplate(token, t),
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
  isTherapist?: boolean
) => {
  const t = await getTranslations("VerificationEmail");
  const locale = await getLocale();

  const message = {
    from_email: "no-reply@daqilhealth.com",
    subject: isTherapist ? t("subjectTherapist") : t("subject"),
    html: await verificationEmailTemplate(t, token, locale, isTherapist),
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
  const locale = await getLocale();
  const message = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("subject"),
    html: await passwordResetEmailTemplate(token, t, locale),
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
    clientTimeZone: string;
    therapistTimeZone: string;
    reason: string;
    therapistName: string;
    clientName: string;
    refundIssued: boolean;
    refundAmount: number;
  }
) => {
  const t = await getTranslations("AppointmentCancellationEmail");
  const locale = await getLocale();

  const refundMessage = appointmentDetails.refundIssued
    ? `${t("refundLabel")}: $${appointmentDetails.refundAmount}`
    : "";

  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject"),
    html: await appointmentCancellationTemplate(
      appointmentDetails,
      true,
      t,
      refundMessage,
      locale
    ),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await appointmentCancellationTemplate(
      appointmentDetails,
      false,
      t,
      refundMessage,
      locale
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

export const sendIntroBookingConfirmationMail = async (
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
    clientTimeZone: string;
    therapistTimeZone: string;
    clientPhoneNumber: string;
    clientEmail: string;
  },
  t: any,
  locale: string,
  introAnswers?: any
) => {
  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject"),
    html: await introBookingConfirmationTemplate(
      appointmentDetails,
      true,
      t,
      locale,
      false,
      introAnswers
    ),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await introBookingConfirmationTemplate(
      appointmentDetails,
      false,
      t,
      locale
    ),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  const messages = [
    mailchimpTx.messages.send({ message: therapistMessage as any }),
    mailchimpTx.messages.send({ message: clientMessage as any }),
  ];

  if (process.env.NODE_ENV === "production") {
    const adminMessage = {
      from_email: "no-reply@daqilhealth.com",
      subject: t("therapistSubject"),
      html: await introBookingConfirmationTemplate(
        appointmentDetails,
        true,
        t,
        locale,
        true,
        introAnswers
      ),
      to: [
        {
          email: "hello@daqil.com",
          type: "to",
        },
      ],
    };
    messages.push(mailchimpTx.messages.send({ message: adminMessage as any }));
  }

  try {
    await Promise.all(messages);
  } catch (error) {
    console.error("Error sending intro booking confirmation email:", error);
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
    therapistTimeZone: string;
    clientTimeZone: string;
  }
) => {
  const t = await getTranslations("NonPaidAppointmentConfirmationEmail");
  const locale = await getLocale();
  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject"),
    html: await nonPaidAppointmentConfirmationTemplate(
      appointmentDetails,
      true,
      t,
      locale
    ),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await nonPaidAppointmentConfirmationTemplate(
      appointmentDetails,
      false,
      t,
      locale
    ),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  const messages = [
    mailchimpTx.messages.send({ message: therapistMessage as any }),
    mailchimpTx.messages.send({ message: clientMessage as any }),
  ];

  try {
    if (process.env.NODE_ENV === "production") {
      const adminMessage = {
        from_email: "no-reply@daqilhealth.com",
        subject: t("therapistSubject"),
        html: await nonPaidAppointmentConfirmationTemplate(
          appointmentDetails,
          true,
          t,
          locale,
          true
        ),
        to: [
          {
            email: "hello@daqil.com",
            type: "to",
          },
        ],
      };
      messages.push(
        mailchimpTx.messages.send({ message: adminMessage as any })
      );
    }

    await Promise.all(messages);
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
    therapistTimeZone: string;
    clientTimeZone: string;
  },
  t: any,
  locale: string
) => {
  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject", {
      clientName: appointmentDetails.clientName,
    }),
    html: await invoicePaidTemplate(appointmentDetails, true, t, locale),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await invoicePaidTemplate(appointmentDetails, false, t, locale),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  const messages = [
    mailchimpTx.messages.send({ message: therapistMessage as any }),
    mailchimpTx.messages.send({ message: clientMessage as any }),
  ];

  if (process.env.NODE_ENV === "production") {
    const adminMessage = {
      from_email: "no-reply@daqilhealth.com",
      subject: t("therapistSubject", {
        clientName: appointmentDetails.clientName,
      }),
      html: await invoicePaidTemplate(appointmentDetails, true, t, locale),
      to: [
        {
          email: "hello@daqil.com",
          type: "to",
        },
      ],
    };
    messages.push(mailchimpTx.messages.send({ message: adminMessage as any }));
  }

  try {
    await Promise.all(messages);
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
    amountPaid?: string;
    paymentMethod: string;
    transactionId: string;
    therapistTimeZone: string;
    clientTimeZone: string;
  },
  t: any,
  locale: string
) => {
  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject"),
    html: await paidAppointmentConfirmationTemplate(
      appointmentDetails,
      true,
      t,
      locale
    ),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await paidAppointmentConfirmationTemplate(
      appointmentDetails,
      false,
      t,
      locale
    ),
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  const messages = [
    mailchimpTx.messages.send({ message: therapistMessage as any }),
    mailchimpTx.messages.send({ message: clientMessage as any }),
  ];

  if (process.env.NODE_ENV === "production") {
    const adminMessage = {
      from_email: "no-reply@daqilhealth.com",
      subject: t("therapistSubject"),
      html: await paidAppointmentConfirmationTemplate(
        appointmentDetails,
        true,
        t,
        locale,
        true
      ),
      to: [
        {
          email: "hello@daqil.com",
          type: "to",
        },
      ],
    };
    messages.push(mailchimpTx.messages.send({ message: adminMessage as any }));
  }

  try {
    await Promise.all(messages);
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
  t: any,
  locale: string
) => {
  const message = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("subject"),
    html: await paymentReminderTemplate(
      clientFirstName,
      appointmentId,
      appointmentStartTime,
      t,
      locale
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
    clientTimeZone: string;
  },
  t: any,
  locale: string
) => {
  try {
    const subject = t("subject");
    const html = await reminderEmailTemplate(t, appointmentDetails, locale);

    const message = {
      from_email: "no-reply@daqilhealth.com",
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
  t: any,
  locale: string
) => {
  const therapistMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("therapistSubject"),
    html: await therapistNotPaidInTimeTemplate(appointmentDetails, t, locale),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("clientSubject"),
    html: await clientNotPaidInTimeTemplate(appointmentDetails, t, locale),
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

export const sendMeetingLink = async (
  email: string,
  hostFirstName: string,
  hostLastName: string,
  appointmentTime: string,
  t: any,
  appointmentId: string,
  locale: string
): Promise<void> => {
  try {
    // Generate the meeting link using the appointmentId
    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/appointments/${appointmentId}`;

    // Get the email subject from translations
    const subject = t("subject", { appointmentTime });

    // Generate the email content using the template
    const html = await meetingLinkEmailTemplate({
      hostFirstName,
      hostLastName,
      appointmentTime,
      meetingLink,
      t,
      locale,
    });

    // Create the email message
    const message = {
      from_email: "no-reply@daqilhealth.com",
      subject: subject,
      html: html,
      to: [
        {
          email: email,
          type: "to",
        },
      ],
    };

    // Send the email via Mailchimp Transactional
    await mailchimpTx.messages.send({
      message: message as any,
    });

    console.log(`Meeting link email sent to ${email}`);
  } catch (error) {
    console.error("Error sending meeting link email:", error);
    throw error;
  }
};

export const sendIntroBookingConfirmationMailWithLink = async (
  therapistEmail: any,
  clientEmail: any,
  appointmentDetails: any,
  locale: any
) => {
  const t = await getTranslations("IntroBookingLinkConfirmationEmail");

  const confirmLink = `${
    process.env.NEXT_PUBLIC_APP_URL
  }/${locale}/intro-booking-confirmation?appointmentId=${encodeURIComponent(
    appointmentDetails.appointmentId
  )}`;

  const { clientEmailHtml } = await introBookingConfirmationEmailTemplate(
    appointmentDetails,
    confirmLink,
    t,
    locale
  );

  const clientMessage = {
    from_email: "no-reply@daqilhealth.com",
    subject: t("actionRequiredSubject"),
    html: clientEmailHtml,
    to: [
      {
        email: clientEmail,
        type: "to",
      },
    ],
  };

  try {
    await Promise.all([
      mailchimpTx.messages.send({ message: clientMessage as any }),
    ]);
  } catch (error) {
    console.error(
      "Error sending intro booking confirmation email with link:",
      error
    );
  }
};
