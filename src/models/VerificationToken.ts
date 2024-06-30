import mongoose from "mongoose";

const Schema = mongoose.Schema;

const verificationToken = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  { collection: "verification_tokens" }
);

export default mongoose.models?.VerificationToken ||
  mongoose.model("VerificationToken", verificationToken);
