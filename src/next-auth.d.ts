import { Types } from "mongoose";
import NextAuth, { type DefaultSession, type } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  id: string;
  email: string;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  firstName: string;
  lastName: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
