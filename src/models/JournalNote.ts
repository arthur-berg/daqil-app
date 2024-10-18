import mongoose from "mongoose";

const Schema = mongoose.Schema;

const journalNote = new Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    note: {
      type: String,
      required: false,
    },
    summary: {
      type: String,
      required: false,
    },
    summaryStatus: {
      type: String,
      enum: ["notStarted", "pending", "review", "completed"],
      default: "pending",
    },

    archiveId: {
      type: String,
      required: false,
    },
  },
  { collection: "journal_notes", timestamps: true }
);

export default mongoose.models?.JournalNote ||
  mongoose.model("JournalNote", journalNote);
