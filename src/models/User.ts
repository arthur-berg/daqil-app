import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: false,
    },
    emailVerified: {
      type: Date,
      required: false,
      default: null,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    isAccountSetupDone: {
      type: Boolean,
      default: false,
    },
    isOnboardingDone: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER", "THERAPIST"],
      default: "USER",
    },
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    twoFactorConfirmation: {
      type: Schema.Types.ObjectId,
      ref: "TwoFactorConfirmation",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
