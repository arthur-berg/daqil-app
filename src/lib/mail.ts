import mailchimp from "@mailchimp/mailchimp_transactional";
import mailchimpMarketing from "@mailchimp/mailchimp_marketing";
import { UserRole } from "@/generalTypes";
import {
  twoFactorTokenTemplate,
  verificationEmailTemplate,
  passwordResetEmailTemplate,
} from "./emailTemplates";

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
  // No error on PC computer. Check if it's only the mac? Maybe due to IP?
  try {
    const listId =
      userRole && userRole === UserRole.THERAPIST
        ? process.env.MAILCHIMP_THERAPIST_LIST_ID
        : process.env.MAILCHIMP_LIST_ID;

    await mailchimpMarketing.lists.getListMember(listId as string, email);

    // If we get here, the user exists, so no need to add them again
    return { success: "User already exists in the list" };
  } catch (error: any) {
    if (error?.status === 404) {
      // If the error is a 404, it means the user does not exist
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
