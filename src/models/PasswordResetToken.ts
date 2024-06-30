import mongoose from "mongoose";

const Schema = mongoose.Schema;

const passwordResetToken = new Schema(
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
  { collection: "password_reset_tokens" }
);

export default mongoose.models?.PasswordResetToken ||
  mongoose.model("PasswordResetToken", passwordResetToken);
