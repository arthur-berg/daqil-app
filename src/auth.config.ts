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

          /* 
          
          TODO. Hämta användare med mongo atlas api. Använd denna wrapper https://www.npmjs.com/package/mongo-rest-client
      
          Eller kolla:

          https://github.com/vercel/next.js/discussions/46722

          T.ex
          As a workaround, you can use an API route + useSWR (with refreshInterval) to keep the session alive. At least that is what I am doing for now..

          Alternativt vänta med detta
          */

          var data = JSON.stringify({
            collection: "users",
            database: "dev",
            dataSource: "dev-zakina-app",
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
              "https://eu-west-2.aws.data.mongodb-api.com/app/data-tocirom/endpoint/data/v1/action/findOne",
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

            if (!user || !user.password) return null;

            const passwordsMatch = await bcrypt.compare(
              password,
              user.password
            );
            if (passwordsMatch) return user;
          } catch (error) {
            console.log(error);
          }

          /* const user = await getUserByEmail(email); */
        }

        throw new Error(t("invalidCredentials"));
      },
    }),
  ],
} satisfies NextAuthConfig;
