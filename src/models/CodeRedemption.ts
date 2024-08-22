import mongoose from "mongoose";

const Schema = mongoose.Schema;

const codeRedemptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discountCodeId: {
      type: Schema.Types.ObjectId,
      ref: "DiscountCode",
      required: true,
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { collection: "code_redemptions" }
);

export default mongoose.models?.CodeRedemption ||
  mongoose.model("CodeRedemption", codeRedemptionSchema);
