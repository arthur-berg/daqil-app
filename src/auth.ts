import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getUserById } from "@/data/user";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb";
import authConfig from "@/auth.config";

import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import TwoFactorConfirmation from "@/models/TwoFactorConfirmation";
import { UserRole } from "@/generalTypes";
import { getAccountByUserId } from "@/data/account";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await User.findByIdAndUpdate((user as any)?._id, {
        emailVerified: new Date(),
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById((user as any)?._id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser?.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser._id
        );
        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await TwoFactorConfirmation.findByIdAndDelete(
          twoFactorConfirmation._id
        );
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.isOnboardingDone = token.isOnboardingDone as boolean;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.firstName = token.firstName as { en: string; ar: string };
        session.user.lastName = token.lastName as { en: string; ar: string };
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.selectedTherapist = token.selectedTherapist as any;
        session.user.assignedClients = token.assignedClients as string[];
        session.user.therapistWorkProfile = token.therapistWorkProfile as any;
        session.user.image = token.image as string;
        session.user.selectedTherapistHistory =
          token.selectedTherapistHistory as any;
        session.user.stripeCustomerId = token.stripeCustomerId as string;
        session.user.stripePaymentMethodId =
          token.stripePaymentMethodId as string;
        session.user.appointments = token.appointments as any;
        session.user.personalInfo = token.personalInfo as any;
        if (
          session.user.role === "THERAPIST" ||
          session.user.role === "ADMIN"
        ) {
          session.user.availableTimes = token.availableTimes as any;
        }
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOnboardingDone = existingUser.isOnboardingDone;
      token.isOAuth = !!existingAccount;
      token.firstName = existingUser.firstName;
      token.lastName = existingUser.lastName;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.selectedTherapist = existingUser.selectedTherapist;
      token.assignedClients = existingUser.assignedClients;
      token.therapistWorkProfile = existingUser.therapistWorkProfile;
      token.image = existingUser.image;
      token.selectedTherapistHistory = existingUser.selectedTherapistHistory;
      token.stripeCustomerId = existingUser.stripeCustomerId;
      token.stripePaymentMethodId = existingUser.stripePaymentMethodId;
      token.appointments = existingUser.appointments;
      token.personalInfo = existingUser.personalInfo;
      if (existingUser.role === "THERAPIST" || existingUser.role === "ADMIN") {
        token.availableTimes = existingUser.availableTimes;
      }

      return token;
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  ...authConfig,
});
