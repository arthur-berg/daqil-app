import mongoose from "mongoose";

const Schema = mongoose.Schema;

//Reason we have participants as array is req might change in the future to require multiple participants

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
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        showUp: {
          type: Boolean,
          default: false,
        },
      },
    ],
    durationInMinutes: {
      type: Number,
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
    price: {
      type: Number,
      required: false,
      /* validate: {
        validator: function (this: any, value: number): boolean {
          return value === undefined || this.credits === undefined;
        },
        message: "Either price or credits must be set, not both.",
      }, */
    },
    credits: {
      type: Number,
      required: false,
      /*  validate: {
        validator: function (this: any, value: number): boolean {
          return value === undefined || this.price === undefined;
        },
        message: "Either credits or price must be set, not both.",
      }, */
    },
    currency: {
      type: String,
      enum: ["USD", "AED", "EUR"],
      required: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["confirmed", "canceled", "completed", "pending"],
      default: "confirmed",
    },
    cancellationReason: {
      type: String,
      enum: ["no-show-both", "no-show-host", "no-show-participant", "custom"],
      required: function (this: any) {
        return this.status === "canceled";
      },
    },
    customCancellationReason: {
      type: String,
      required: function (this: any) {
        return this.cancellationReason === "custom";
      },
    },
    hostShowUp: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "appointments",
    timestamps: true,
  }
);

export default mongoose.models?.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
