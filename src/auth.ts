import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getUserById } from "@/data/user";
import User from "@/models/User";
import clientPromise from "@/lib/mongodb";
import authConfig from "@/auth.config";
import connectToMongoDB from "@/lib/mongoose";

import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import TwoFactorConfirmation from "@/models/TwoFactorConfirmation";
import { UserRole } from "@/generalTypes";
import { getAccountByUserId } from "@/data/account";
import { addUserToSubscriberList } from "@/lib/mail";

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    /*  async signOut({ token }) {
      console.log("token", token);
    }, */
    async linkAccount({ user }) {
      await connectToMongoDB();
      await User.findByIdAndUpdate((user as any)?._id, {
        emailVerified: new Date(),
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        // For OAuth, handle name splitting and populate firstName/lastName with 'en' property
        const firstTimeLogin = !!user.name;

        if (firstTimeLogin) {
          const userToSaveInDB = user as any;
          const [firstName, ...lastNameParts] = userToSaveInDB.name.split(" ");
          (userToSaveInDB as any).firstName = { en: firstName || "", ar: "" };
          (userToSaveInDB as any).lastName = {
            en: lastNameParts.join(" ") || "",
            ar: "",
          };
          delete userToSaveInDB.name;

          userToSaveInDB.isAccountSetupDone = false;
          userToSaveInDB.isOnboardingDone = false;

          userToSaveInDB.isTwoFactorEnabled = false;
          userToSaveInDB.role = UserRole.CLIENT;
          userToSaveInDB.clientBalance = { amount: 0, currency: "USD" };
          userToSaveInDB.selectedTherapist = {
            therapist: null,
            clientIntroTherapistSelectionStatus: "PENDING",
            introCallDone: false,
          };
          userToSaveInDB.appointments = [];
          userToSaveInDB.selectedTherapistHistory = [];
          const createdAt = new Date();
          userToSaveInDB.createdAt = createdAt;

          const response = await addUserToSubscriberList(user.email as string);

          if (response?.error) {
            console.error(response.error);
          }
        }
        return true;
      }
      await connectToMongoDB();

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
      if (token.error === "inactive-user") {
        session.user.error = token.error as any;
        return session;
      }
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
        session.user.image = token.image as string;
        session.user.stripeCustomerId = token.stripeCustomerId as string;
        session.user.stripePaymentMethodId =
          token.stripePaymentMethodId as string;
        session.user.settings = token.settings as any;

        session.user.isAccountSetupDone = token.isAccountSetupDone as any;

        session.user.hasUTMSaved = token.marketingCampaignData as boolean;

        if (session.user.role === "CLIENT") {
          session.user.selectedTherapist = token.selectedTherapist as any;
        }
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;
      await connectToMongoDB();

      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        token.error = "inactive-user";
        return token;
      }

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isAccountSetupDone = existingUser.isAccountSetupDone;
      token.isOnboardingDone = existingUser.isOnboardingDone;
      token.isOAuth = !!existingAccount;
      token.firstName = existingUser.firstName;
      token.lastName = existingUser.lastName;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.image = existingUser.image;
      token.stripeCustomerId = existingUser.stripeCustomerId;
      token.stripePaymentMethodId = existingUser.stripePaymentMethodId;
      token.settings = existingUser.settings;
      token.hasUTMSaved = !!token.marketingCampaignData;

      if (existingUser.role === "CLIENT") {
        token.selectedTherapist = existingUser.selectedTherapist;
      }

      return token;
    },
  },
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  ...authConfig,
});
