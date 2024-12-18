import mongoose from "mongoose";

const Schema = mongoose.Schema;

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
    appointmentTypeId: {
      type: Schema.Types.ObjectId,
      ref: "AppointmentType",
    },
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
      enum: [
        "no-show-both",
        "no-show-host",
        "no-show-participant",
        "not-paid-in-time",
        "custom",
      ],
      required: function (this: any) {
        return this.status === "canceled";
      },
    },
    customCancellationUserRole: {
      type: String,
      enum: ["ADMIN", "CLIENT", "THERAPIST"],
      required: false,
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
