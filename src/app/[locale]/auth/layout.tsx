import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import connectToMongoDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  await connectToMongoDB();

  const session = await auth();

  console.log("session", session);

  if (!!session) {
    redirect("/book-appointment");
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

export default AuthLayout;
