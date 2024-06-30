import mongoose from "mongoose";

const Schema = mongoose.Schema;

const twoFactorToken = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: false,
    },
    token: {
      type: String,
      required: false,
      unique: true,
    },
    expires: {
      type: Date,
      required: false,
    },
  },
  { collection: "two_factor_tokens" }
);

export default mongoose.models?.TwoFactorToken ||
  mongoose.model("TwoFactorToken", twoFactorToken);
