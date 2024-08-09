import mongoose from "mongoose";

const Schema = mongoose.Schema;

const participantSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: "User",
    required: true,
  },
  showUp: {
    type: Boolean,
    default: false,
  },
});

const videoSessionSchema = new Schema(
  {
    sessionId: {
      type: String,
      unique: true,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    hostUserId: {
      type: String,
      ref: "User",
      required: false,
    },

    appointmentId: {
      type: String,
      ref: "Appointment",
      required: true,
    },
    participants: [participantSchema],
  },
  { collection: "video_sessions" }
);

export default mongoose.models?.VideoSession ||
  mongoose.model("VideoSession", videoSessionSchema);
