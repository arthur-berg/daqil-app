import mailchimp from "@mailchimp/mailchimp_transactional";
import mailchimpMarketing from "@mailchimp/mailchimp_marketing";

mailchimpMarketing.setConfig({
  apiKey: process.env.MAILCHIMP_MARKETING_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
});

const mailchimpTx = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_KEY || "");

const domain = process.env.NEXT_PUBLIC_APP_URL;

export const addUserToSubscriberList = async (email: string) => {
  try {
    await mailchimpMarketing.lists.getListMember(
      process.env.MAILCHIMP_LIST_ID as string,
      email
    );

    // If we get here, the user exists, so no need to add them again
    return { success: "User already exists in the list" };
  } catch (error: any) {
    if (error.status === 404) {
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
      // Log other errors
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
    subject: "2FA Code",
    html: `<p>Your 2FA code ${token}</p>`,
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
  password?: string
) => {
  const encodedToken = encodeURIComponent(token);
  let confirmLink = `${domain}/auth/new-verification?token=${encodedToken}`;

  const temporaryPasswordMessage = password
    ? `Here is your temporary password: <strong>${password}</strong><br>`
    : "";

  const message = {
    from_email: "info@zakina-app.com",
    subject: "Confirm your email",
    html: `<p>Welcome to Zakina. ${
      temporaryPasswordMessage && `<p>${temporaryPasswordMessage}</p>`
    } Click <a href="${confirmLink}">here</a> to confirm email, change password and finish your account setup.</p>`,
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
  const encodedToken = encodeURIComponent(token);
  const resetLink = `${domain}/auth/new-password?token=${encodedToken}`;

  const message = {
    from_email: "info@zakina-app.com",
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
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
