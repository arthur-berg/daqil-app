import mongoose from "mongoose";

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
  },
  providerAccountId: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: false,
  },
  access_token: {
    type: String,
    required: false,
  },
  expires_at: {
    type: Number,
    required: false,
  },
  token_type: {
    type: String,
    required: false,
  },
  scope: {
    type: String,
    required: false,
  },
  id_token: {
    type: String,
    required: false,
  },
  session_state: {
    type: String,
    required: false,
  },
});

accountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export default mongoose.models?.Account ||
  mongoose.model("Account", accountSchema);
