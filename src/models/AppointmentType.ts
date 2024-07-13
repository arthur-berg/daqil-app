import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentTypeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    currency: {
      type: String,
      enum: ["USD", "AED", "EUR"],
      required: false,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    maxParticipants: {
      type: Number,
      required: false,
    },
    price: {
      type: Number,
      required: false,
      validate: {
        validator: function (this: any, value: number): boolean {
          return value === undefined || this.credits === undefined;
        },
        message: "Either price or credits must be set, not both.",
      },
    },
    credits: {
      type: Number,
      required: false,
      validate: {
        validator: function (this: any, value: number): boolean {
          return value === undefined || this.price === undefined;
        },
        message: "Either credits or price must be set, not both.",
      },
    },
    durationInMinutes: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["appointment", "group"],
      required: true,
      default: "appointment",
    },
  },
  {
    collection: "appointment_types",
    timestamps: true,
  }
);

export default mongoose.models?.AppointmentType ||
  mongoose.model("AppointmentType", appointmentTypeSchema);
