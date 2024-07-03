import mailchimp from "@mailchimp/mailchimp_transactional";

const mailchimpTx = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_KEY || "");

const domain = process.env.NEXT_PUBLIC_APP_URL;

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
    const response = await mailchimpTx.messages.send({
      message: message as any,
    });
    console.log(response);
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
    const response = await mailchimpTx.messages.send({
      message: message as any,
    });
    console.log(response);
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
    const response = await mailchimpTx.messages.send({
      message: message as any,
    });
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};
