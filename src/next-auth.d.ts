import { Types } from "mongoose";
import NextAuth, { type DefaultSession, type } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  id: string;
  email: string;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  firstName: {
    en: string;
    ar: string;
  };
  lastName: {
    en: string;
    ar: string;
  };
  marketingCampaignData: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    dateCaptured: Date;
  };
  /*  hasUTMSaved: boolean; */
  error?: "inactive-user";
  isOnboardingDone: boolean;
  isAccountSetupDone: boolean;
  isProfessionalAgreementDone?: boolean;
  appointments: {
    date: Date;
    bookedAppointments: string[];
    temporarilyReservedAppointments: string[];
  }[];
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;
  personalInfo: {
    phoneNumber: string;
    sex: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: Date;
    country: string;
  };
  selectedTherapistHistory?: {
    therapist: string;
    startDate: Date;
    endDate?: Date;
    appointmentCount: number;
    current: boolean;
  }[];
  selectedTherapist?: {
    therapist: string;
    introCallDone: boolean;
    clientIntroTherapistSelectionStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  };
  assignedClients?: string[];

  therapistWorkProfile?: {
    en: {
      title: string;
      description: string;
    };
    ar: {
      title: string;
      description: string;
    };
  };
  availableTimes?: {
    settings: {
      interval: number;
      futureBookingDelay?: number;
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
    timeZone?: string;
  };
  paymentSettings: any;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
