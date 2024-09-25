import PaymentSettingsForm from "@/app/[locale]/(protected)/therapist/settings/payment-details-setup/payment-settings-form";
import connectToMongoDB from "@/lib/mongoose";

const PaymentSettingsPage = async () => {
  await connectToMongoDB();

  return (
    <div className="max-w-2xl mx-auto bg-white py-6 px-4 sm:p-10 rounded-md relative">
      <PaymentSettingsForm />
    </div>
  );
};

export default PaymentSettingsPage;
