import PaymentSettingsForm from "@/app/[locale]/(protected)/therapist/settings/payment/payment-settings-form";
import connectToMongoDB from "@/lib/mongoose";
const PaymentSettingsPage = async () => {
  await connectToMongoDB();

  return (
    <div className="max-w-2xl mx-auto bg-white py-6 px-2 sm:p-10 rounded-md ">
      <PaymentSettingsForm />
    </div>
  );
};

export default PaymentSettingsPage;
