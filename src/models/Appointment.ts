import mongoose from "mongoose";

const Schema = mongoose.Schema;

//Reason we have participants as array is req might change in the future to require multiple participants

const appointmentSchema = new Schema(
  {
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
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
    amountPaid: {
      type: Number,
      required: false,
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
    payment: {
      method: {
        type: String,
        enum: ["payBeforeBooking", "payAfterBooking"],
        required: true,
      },
      status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
        index: true,
      },
      intentId: {
        type: String,
        required: false,
      },
      paymentExpiryDate: {
        type: Date,
        required: function (this: any) {
          return this.method === "payBeforeBooking";
        },
        default: function (this: any) {
          if (this.method === "payBeforeBooking") {
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 15);
            return expiryTime;
          }
          return undefined;
        },
        index: true,
      },
    },
    status: {
      type: String,
      enum: [
        "confirmed",
        "canceled",
        "completed",
        "pending",
        "temporarily-reserved",
      ],
      default: "confirmed",
      index: true,
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
