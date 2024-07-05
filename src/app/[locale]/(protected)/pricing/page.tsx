import CustomerPortalButton from "./customer-portal-button";
import PricingForm from "./pricing-form";

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
