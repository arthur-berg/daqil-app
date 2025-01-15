import { UserRole } from "@/generalTypes";
import * as z from "zod";

export const CancelAppointmentSchema = z.object({
  appointmentId: z.string(),
  reason: z.string(),
});

export const SymptomsSchema = z.object({
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom."),
});

export const LanguagesSchema = z.object({
  languages: z.array(z.string()).min(1, "Please select at least one symptom."),
});

export const TherapistMyProfileSchema = z.object({
  workDescriptionEn: z.string().min(1, {
    message: "Description is required",
  }),
  workDescriptionAr: z.string().min(1, {
    message: "Description is required",
  }),
});

export const DiscountCodeSchema = z
  .object({
    code: z.string().min(1, {
      message: "Code is required",
    }),
    percentage: z
      .number()
      .min(1, {
        message: "Percentage must be at least 1",
      })
      .max(100, {
        message: "Percentage cannot exceed 100",
      })
      .nullable(),
    firstTimeUserOnly: z.boolean().optional(),
    limitPerUser: z
      .number()
      .min(1, {
        message: "Limit per user must be at least 1",
      })
      .nullable()
      .optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
  })
  .refine(
    (data) => {
      // Ensure startDate is before endDate if both are provided
      if (data.startDate && data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"], // specify the path to the error
    }
  );

export const SettingsSchema = z
  .object({
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.CLIENT, UserRole.THERAPIST]),
    email: z.optional(z.string().email()),
    password: z
      .string()
      .min(6, "String must contain at least 6 characters")
      .optional()
      .or(z.literal("")), // Allow an empty string
    newPassword: z
      .string()
      .min(6, "String must contain at least 6 characters")
      .optional()
      .or(z.literal("")), // Allow an empty string
    settings: z.object({
      timeZone: z.string().min(1, {
        message: "Timezone is required",
      }),
    }),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }
      return true;
    },
    {
      message: "New password is required!",
      path: ["newPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required!",
      path: ["password"],
    }
  );

export const RecurringAvailabilitySchema = z.object({
  day: z.string(),
  timeRanges: z.array(
    z.object({
      startTime: z.union([z.string(), z.date()]),
      endTime: z.union([z.string(), z.date()]),
      appointmentTypeIds: z.array(z.string()),
    })
  ),
});

export const RecurringAvailabilitySettingsSchemaBE = z.object({
  interval: z.number().min(1, "Interval must be at least 1 minute").default(15),
  appointmentTypeIds: z.array(z.string()).optional(),
  futureBookingDelay: z
    .number()
    .min(1, "Future booking delay must be at least 15 minute")
    .default(60),
});

export const NonRecurringAvailabilitySchemaFE = z.object({
  date: z.date(),
  timeRanges: z.array(
    z.object({
      startDate: z.string({
        required_error: "From time is required",
      }),
      endDate: z.string({
        required_error: "To time is required",
      }),
      appointmentTypeIds: z.array(z.string()),
    })
  ),
});

export const NonRecurringAvailabilitySchemaBE = z.object({
  date: z.date(),
  timeRanges: z.array(
    z.object({
      startDate: z.date({
        required_error: "From time is required",
      }),
      endDate: z.date({
        required_error: "To time is required",
      }),
      appointmentTypeIds: z.array(z.string()),
    })
  ),
});

export const BlockAvailabilitySchemaBE = z.object({
  date: z.date(),
  timeRanges: z.array(
    z.object({
      startDate: z.date({
        required_error: "From time is required",
      }),
      endDate: z.date({
        required_error: "To time is required",
      }),
      appointmentTypeIds: z.array(z.string()),
    })
  ),
});

export const BlockAvailabilitySchemaFE = z.object({
  date: z.date(),
  timeRanges: z.array(
    z.object({
      startDate: z.string({
        required_error: "From time is required",
      }),
      endDate: z.string({
        required_error: "To time is required",
      }),
    })
  ),
});

export const DefaultAvailabilitySettingsSchemaFE = z.object({
  interval: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 1;
    },
    {
      message: "Interval must be at least 1 minute and a valid number",
    }
  ),
  futureBookingDelay: z.string().refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 15;
    },
    {
      message:
        "Future booking delay must be at least 15 minutes and a valid number",
    }
  ),
  appointmentTypeIds: z.array(z.string()).optional(),
});

export const AppointmentSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a date",
  }),
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .optional(),
  clientId: z.string({
    required_error: "You must select a patient",
  }),
  appointmentTypeId: z.string(),
  description: z.string().optional(),
  paid: z.boolean().optional().default(false),
  status: z
    .enum(["confirmed", "canceled", "completed"])
    .optional()
    .default("confirmed"),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const InviteTherapistSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.optional(
    z.string().min(1, {
      message: "Password is required",
    })
  ),
  code: z.optional(z.string()),
});

export const SetupAccountSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  currentPassword: z.optional(z.string().min(6)),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions.",
  }),
  firstName: z.object({
    en: z.string().min(1, {
      message: "First name (English) is required",
    }),
    ar: z.string().optional(),
  }),
  lastName: z.object({
    en: z.string().min(1, {
      message: "Last name (English) is required",
    }),
    ar: z.string().optional(),
  }),
  personalInfo: z.object({
    phoneNumber: z
      .string()
      .regex(
        /^\+\d{1,4}/,
        "Phone number must start with + followed by country code"
      ),
    sex: z.enum(["MALE", "FEMALE", "OTHER"]),
    dateOfBirth: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, {
      message: "Invalid date format. Use YYYY/MM/DD.",
    }),
    country: z.string(),
  }),
  settings: z.object({
    timeZone: z.string().min(1, {
      message: "Timezone is required",
    }),
  }),
});

export const OAuthAccountSetupSchema = z.object({
  firstName: z.object({
    en: z.string().min(1, {
      message: "First name (English) is required",
    }),
    ar: z.string().optional(),
  }),
  lastName: z.object({
    en: z.string().min(1, {
      message: "Last name (English) is required",
    }),
    ar: z.string().optional(),
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Conditions.",
  }),
  personalInfo: z.object({
    phoneNumber: z.string(),
    sex: z.enum(["MALE", "FEMALE", "OTHER"]),
    dateOfBirth: z.string().regex(/^\d{4}\/\d{2}\/\d{2}$/, {
      message: "Invalid date format. Use YYYY/MM/DD.",
    }),
    country: z.string(),
  }),
  settings: z.object({
    timeZone: z.string().min(1, {
      message: "Timezone is required",
    }),
  }),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
  utmTerm: z.string().nullable().optional(),
  utmContent: z.string().nullable().optional(),
});

export const PaymentSettingsSchema = z.object({
  country: z.string().min(1, "Please select a country"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  accountType: z.enum(["personal", "company"]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  ownerName: z.string().optional(),
  ownerRole: z.string().optional(),
  dob: z.string().optional(),
  placeOfBirth: z.string().optional(),
  citizenship: z.string().optional(),
  bankName: z.string().optional(),
  accountSubtype: z.string().optional(),
  clearingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  confirmAccountNumber: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  companyRegistration: z.string().optional(),
});
