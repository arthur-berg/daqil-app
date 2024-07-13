import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getTranslations } from "next-intl/server";

import { LoginSchema } from "@/schemas";

import type { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "@/data/user";

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);
        const t = await getTranslations("ErrorMessages");
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          /* 
          
          TODO. Hämta användare med mongo atlas api. Använd denna wrapper https://www.npmjs.com/package/mongo-rest-client
      
          Eller kolla:

          https://github.com/vercel/next.js/discussions/46722

          T.ex
          As a workaround, you can use an API route + useSWR (with refreshInterval) to keep the session alive. At least that is what I am doing for now..

          Alternativt vänta med detta
          */

          const user = await getUserByEmail(email); // Kraschar i prod pga av edge + mongoose
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        throw new Error(t("invalidCredentials"));
      },
    }),
  ],
} satisfies NextAuthConfig;
