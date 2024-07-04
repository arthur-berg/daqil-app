import PricingForm from "@/app/(protected)/pricing/pricing-form";
import CustomerPortalButton from "./customer-portal-button";

const PricingPage = () => {
  return (
    <div>
      <div className="mb-4">
        <CustomerPortalButton />
      </div>
      <PricingForm />
    </div>
  );
};

export default PricingPage;
