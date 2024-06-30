import TwoFactorToken from "@/models/TwoFactorToken";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await TwoFactorToken.findOne({ token });

    return twoFactorToken;
  } catch {
    return null;
  }
};

export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const twoFactorToken = await TwoFactorToken.findOne({ email });

    return twoFactorToken;
  } catch {
    return null;
  }
};
