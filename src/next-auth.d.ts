import { Types } from "mongoose";
import NextAuth, { type DefaultSession } from "next-auth";

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
  THERAPIST: "THERAPIST",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
