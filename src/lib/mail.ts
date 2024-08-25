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
} from "./emailTemplates";
import Appointment from "@/models/Appointment";

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
  const message = {
    from_email: "info@zakina-app.com",
    subject: "Your Two-Factor Authentication Code",
    html: twoFactorTokenTemplate(token),
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
  const message = {
    from_email: "info@zakina-app.com",
    subject: "Confirm Your Email Address",
    html: verificationEmailTemplate(token, password, isTherapist),
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

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const message = {
    from_email: "info@zakina-app.com",
    subject: "Reset Your Password",
    html: passwordResetEmailTemplate(token),
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
  }
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: "Appointment Cancellation",
    html: appointmentCancellationTemplate(appointmentDetails, true),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: "Appointment Cancellation",
    html: appointmentCancellationTemplate(appointmentDetails, false),
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
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: "New Appointment Booking",
    html: nonPaidAppointmentConfirmationTemplate(appointmentDetails, true),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: "Appointment Confirmation",
    html: nonPaidAppointmentConfirmationTemplate(appointmentDetails, false),
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
  }
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: `${appointmentDetails.clientName} has paid for their appointment`,
    html: invoicePaidTemplate(appointmentDetails, true),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: "Invoice Successfully Paid",
    html: invoicePaidTemplate(appointmentDetails, false),
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
  }
) => {
  const therapistMessage = {
    from_email: "info@zakina-app.com",
    subject: "New Appointment Booking",
    html: paidAppointmentConfirmationTemplate(appointmentDetails, true),
    to: [
      {
        email: therapistEmail,
        type: "to",
      },
    ],
  };

  const clientMessage = {
    from_email: "info@zakina-app.com",
    subject: "Appointment Confirmation",
    html: paidAppointmentConfirmationTemplate(appointmentDetails, false),
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
  appointmentId: string
) => {
  const message = {
    from_email: "info@zakina-app.com",
    subject: "Reminder: Payment Required for Your Upcoming Appointment",
    html: paymentReminderTemplate(appointmentId), // Use the new template function
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
  appointmentId: string
) => {
  try {
    // Fetch appointment details
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      console.log(`Appointment ${appointmentId} not found.`);
      return;
    }

    const appointmentDetails = {
      date: appointment.startDate.toDateString(),
      time: appointment.startDate.toLocaleTimeString(),
      therapistName: `${appointment.hostUserId.firstName} ${appointment.hostUserId.lastName}`,
      clientName: `${appointment.participants[0].userId.firstName} ${appointment.participants[0].userId.lastName}`,
    };

    // Prepare email content
    const subject = "Upcoming Appointment Reminder";
    const html = reminderEmailTemplate(appointmentDetails);

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

    // Send the email
    await mailchimpTx.messages.send({
      message: message as any,
    });

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
