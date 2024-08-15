import mongoose from "mongoose";

const Schema = mongoose.Schema;

const therapistHistorySchema = new Schema({
  therapist: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: function (this: any) {
      return !this.current;
    },
  },
  current: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const timeRangeSchema = new Schema({
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
});

const timeRangeStringsSchema = new Schema({
  startTime: {
    type: String,
    required: false,
  },
  endTime: {
    type: String,
    required: false,
  },
});

const dateTimesSchema = new Schema({
  date: {
    type: Date,
    required: false,
  },
  timeRanges: [timeRangeSchema],
});

const dayTimesSchema = new Schema({
  day: {
    type: String,
    required: false,
  },
  timeRanges: [timeRangeStringsSchema],
});

const availableTimesSchema = new Schema({
  settings: {
    interval: {
      type: Number,
      required: false,
    },
    fullDayRange: {
      from: {
        type: String,
        required: false,
      },
      to: {
        type: String,
        required: false,
      },
    },
  },
  blockedOutTimes: {
    type: [dateTimesSchema],
    default: function (this: any) {
      return this.role === "THERAPIST" ? [] : undefined;
    },
  },
  nonRecurringAvailableTimes: {
    type: [dateTimesSchema],
    default: function (this: any) {
      return this.role === "THERAPIST" ? [] : undefined;
    },
  },
  recurringAvailableTimes: {
    type: [dayTimesSchema],
    default: function (this: any) {
      return this.role === "THERAPIST" ? [] : undefined;
    },
  },
});

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    therapistWorkProfile: {
      type: {
        en: {
          title: {
            type: String,
            required: false,
          },
          description: {
            type: String,
            required: false,
          },
        },
        ar: {
          title: {
            type: String,
            required: false,
          },
          description: {
            type: String,
            required: false,
          },
        },
      },
      default: function (this: any) {
        if (this.role === "THERAPIST") {
          return {
            en: { title: "", description: "" },
            ar: { title: "", description: "" },
          };
        }
        return undefined;
      },
    },
    hasAccess: {
      type: Boolean,
      default: false,
    },
    priceId: {
      type: String,
      required: false,
    },
    credits: {
      type: Number,
      required: false,
    },
    stripeCustomerId: {
      type: String,
      required: false,
    },
    stripePaymentMethodId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: false,
    },
    emailVerified: {
      type: Date,
      required: false,
      default: null,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    isAccountSetupDone: {
      type: Boolean,
      default: false,
    },
    isOnboardingDone: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["ADMIN", "CLIENT", "THERAPIST"],
      default: "CLIENT",
    },
    selectedTherapistHistory: [therapistHistorySchema],
    selectedTherapist: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedClients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: function (this: any) {
          return this.role === "THERAPIST" ? [] : undefined;
        },
      },
    ],
    accounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
      required: false,
    },
    twoFactorConfirmation: {
      type: Schema.Types.ObjectId,
      ref: "TwoFactorConfirmation",
    },
    appointments: [
      {
        date: String,
        bookedAppointments: [
          {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
          },
        ],
      },
    ],
    availableTimes: {
      type: availableTimesSchema,
      default: function (this: any) {
        if (this.role === "THERAPIST") {
          return {
            blockedOutTimes: [],
            nonRecurringAvailableTimes: [],
            recurringAvailableTimes: [],
            settings: {
              interval: 15,
              fullDayRange: {
                from: "09:00",
                to: "18:00",
              },
            },
          };
        }
        return undefined;
      },
    },
    settings: {
      preferredCurrency: {
        type: String,
        required: false,
        default: "USD",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
