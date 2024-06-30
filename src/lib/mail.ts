import mailchimp from "@mailchimp/mailchimp_transactional";

const mailchimpTx = mailchimp(process.env.MAILCHIMP_TRANSACTIONAL_KEY || "");

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

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  const message = {
    from_email: "info@zakina-app.com",
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
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
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

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
