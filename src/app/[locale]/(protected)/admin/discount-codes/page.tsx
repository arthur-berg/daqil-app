import DiscountCodeForm from "./discount-code-form";

const DiscountCodesPage = () => {
  const discountCodes = [{ code: "testcode", percentage: 10 }];
  return (
    <div className="max-w-3xl bg-white mx-auto p-8 rounded-md w-full">
      <DiscountCodeForm />
      <div className="mt-8">
        <h3 className="text-lg font-medium">Existing Discount Codes</h3>
        <ul className="space-y-2 mt-4">
          {discountCodes.map((code, index) => (
            <li key={index} className="border p-2 rounded-md">
              <p>
                <strong>Code:</strong> {code.code}
              </p>
              <p>
                <strong>Discount:</strong> {code.percentage}%
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiscountCodesPage;
