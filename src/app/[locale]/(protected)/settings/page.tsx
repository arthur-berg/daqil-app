import { NextIntlClientProvider } from "next-intl";
import SettingsForm from "./settings-form";
import { getMessages } from "next-intl/server";

const SettingsPage = async () => {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <SettingsForm />
    </NextIntlClientProvider>
  );
};

export default SettingsPage;
