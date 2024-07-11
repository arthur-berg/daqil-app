import mongoose from "mongoose";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    paid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "confirmed", // Example statuses: 'confirmed', 'canceled', 'completed'
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
  { collection: "appointments" }
);

export default mongoose.models?.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
