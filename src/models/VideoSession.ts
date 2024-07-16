import mongoose from "mongoose";

const Schema = mongoose.Schema;

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
    participants: [
      {
        userId: {
          type: String,
          ref: "User",
        },
      },
    ],
  },
  { collection: "video_sessions" }
);

export default mongoose.models?.VideoSession ||
  mongoose.model("VideoSession", videoSessionSchema);
