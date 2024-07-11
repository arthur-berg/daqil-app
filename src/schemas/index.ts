import { UserRole } from "@/generalTypes";
import * as z from "zod";

export const SettingsSchema = z
  .object({
    firstName: z.optional(z.string()),
    lastName: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.THERAPIST]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
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

export const AppointmentSchema = z.object({
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "End date must be a date",
  }),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  patientId: z.string({
    required_error: "You must select a patient",
  }),

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
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});
