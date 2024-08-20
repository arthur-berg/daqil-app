import DiscountCode from "@/models/DiscountCode";

export const getDiscountCodes = async () => {
  try {
    const discountCodes = await DiscountCode.find().lean();

    return discountCodes;
  } catch {
    return null;
  }
};
