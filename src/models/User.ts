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
  appointmentTypeIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "AppointmentType",
      required: true,
    },
  ],
});

const timeRangeStringsSchema = new Schema({
  startTime: {
    type: Date,
    required: false,
  },
  endTime: {
    type: Date,
    required: false,
  },
  appointmentTypeIds: [
    {
      type: Schema.Types.ObjectId,
      ref: "AppointmentType",
      required: true,
    },
  ],
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
  },
  blockedOutTimes: {
    type: [dateTimesSchema],
  },
  nonRecurringAvailableTimes: {
    type: [dateTimesSchema],
  },
  recurringAvailableTimes: {
    type: [dayTimesSchema],
  },
});

const userSchema = new Schema(
  {
    clientBalance: {
      amount: {
        type: Number,
      },
      currency: {
        type: String,
        enum: ["USD", "AED", "EUR"],
      },
    },
    firstName: {
      en: {
        type: String,
        required: false,
      },
      ar: {
        type: String,
        required: false,
      },
    },
    lastName: {
      en: {
        type: String,
        required: false,
      },
      ar: {
        type: String,
        required: false,
      },
    },
    personalInfo: {
      phoneNumber: { type: String, required: false },
      sex: { type: String, enum: ["MALE", "FEMALE"] },
      dateOfBirth: { type: Date, required: false },
      country: { type: String, required: false },
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
      required: function (this: any) {
        return this.termsAccepted === true;
      },
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
    stripeAccountId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: false,
    },
    therapistInvitationEmail: {
      status: {
        type: String,
        enum: ["NOT_SENT", "SENT"],
        required: false,
      },
      expiryDate: {
        type: Date,
        required: false,
      },
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
      therapist: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      clientIntroTherapistSelectionStatus: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
      },
      introCallDone: {
        type: Boolean,
      },
    },
    assignedClients: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
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
        date: { type: String, required: true },
        bookedAppointments: [
          {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            default: [],
          },
        ],
        temporarilyReservedAppointments: [
          {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            default: [],
          },
        ],
      },
    ],
    availableTimes: {
      type: availableTimesSchema,
    },
    settings: {
      preferredCurrency: {
        type: String,
        required: false,
        default: "USD",
      },
      timeZone: {
        type: String,
        required: false,
        default: "America/New_York",
      },
      hiddenProfile: {
        type: Boolean,
        required: false,
      },
    },
    paymentSettings: {
      type: { type: String, enum: ["personal", "company"] },
      personal: {
        kyc: {
          firstName: String,
          lastName: String,
          dateOfBirth: Date,
          placeOfBirth: String,
          citizenship: String,
        },
        bankDetails: {
          accountNumber: String,
          bankName: String,
          clearingNumber: String,
          accountType: { type: String, enum: ["checking", "savings"] },
        },
      },
      company: {
        kyc: {
          ownerName: String,
          ownerRole: String,
          dateOfBirth: Date,
          placeOfBirth: String,
          citizenship: String,
          companyRegistration: String,
        },
        bankDetails: {
          iban: String,
          swift: String,
          bankName: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.User || mongoose.model("User", userSchema);
