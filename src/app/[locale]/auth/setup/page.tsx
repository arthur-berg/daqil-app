import { SetupForm } from "@/components/auth/setup-form";
import { NextIntlClientProvider } from "next-intl";

const SetupPage = async () => {
  console.log("here");
  return (
    <NextIntlClientProvider>
      <SetupForm />
    </NextIntlClientProvider>
  );
};

export default SetupPage;
