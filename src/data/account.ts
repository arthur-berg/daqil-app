import Account from "@/models/Account";

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await Account.findOne({ userId: userId });
    return account;
  } catch {
    return null;
  }
};
