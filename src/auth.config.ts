import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getTranslations } from "next-intl/server";

import { LoginSchema } from "@/schemas";

import type { NextAuthConfig } from "next-auth";

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

          const data = JSON.stringify({
            collection: "users",
            database: process.env.MONGO_DB_NAME as string,
            dataSource: process.env.MONGO_OPEN_API_DATASOURCE as string,
            filter: {
              email: email,
            },
            projection: {
              _id: 1,
              email: 1,
              password: 1,
            },
          });

          try {
            const response = await fetch(
              `${process.env.MONGO_OPEN_API_ENDPOINT as string}/findOne`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Request-Headers": "*",
                  "api-key": process.env.MONGODB_OPEN_API_SECRET as string,
                },
                body: data,
              }
            );

            const { document: user } = await response.json();

            if (user) {
              user.id = user._id;
            }

            if (!user || !user.password) return null;

            const passwordsMatch = await bcrypt.compare(
              password as string,
              user.password
            );

            if (passwordsMatch) return user;
          } catch (error) {
            console.log(error);
          }
        }

        throw new Error(t("invalidCredentials"));
      },
    }),
  ],
} satisfies NextAuthConfig;
