import mongoose from "mongoose";

const Schema = mongoose.Schema;

const twoFactorConfirmation = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { collection: "two_factor_confirmations" }
);

export default mongoose.models?.TwoFactorConfirmation ||
  mongoose.model("TwoFactorConfirmation", twoFactorConfirmation);
