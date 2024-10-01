import mongoose from "mongoose";

const Schema = mongoose.Schema;

const scheduledTask = new Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    type: {
      type: String,
      enum: [
        "statusUpdate",
        "payBeforePaymentExpiredStatusUpdate",
        "payAfterPaymentExpiredStatusUpdate",
        "emailReminder",
        "smsReminder",
        "paymentReminder",
        "meetingLink",
      ],
    },
    taskId: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "scheduled_tasks" }
);

export default mongoose.models?.ScheduledTask ||
  mongoose.model("ScheduledTask", scheduledTask);
