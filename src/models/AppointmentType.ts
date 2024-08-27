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
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationInMinutes: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "appointment_types",
  }
);

export default mongoose.models?.AppointmentType ||
  mongoose.model("AppointmentType", appointmentTypeSchema);
