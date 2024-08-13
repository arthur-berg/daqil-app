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
  isOnboardingDone: boolean;
  appointments: string[];
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
  selectedTherapist?: string;
  assignedClients?: string[];
  therapistWorkProfile?: {
    title: string;
    description: string;
  };
  availableTimes?: {
    settings: {
      interval: number;
      fullDayRange: {
        from: string;
        to;
      };
    };
    blockedOutTimes: {
      date: Date;
      timeRanges: {
        startDate: Date;
        endDate: Date;
      }[];
    }[];
    nonRecurringAvailableTimes: {
      date: Date;
      timeRanges: {
        startDate: Date;
        endDate: Date;
      }[];
    }[];
    recurringAvailableTimes: {
      day: string;
      timeRanges: {
        startTime: Date;
        endTime: Date;
      }[];
    };
  };
  settings?: {
    preferredCurrency?: "USD" | "AED" | "EUR";
  };
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
