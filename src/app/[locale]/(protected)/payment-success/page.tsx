const PaymentSuccessPage = ({
  searchParams: { amount },
}: {
  searchParams: { amount: string };
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-4 max-w-4xl mx-auto">
      <div className="mt-10">
        <h1 className="text-4xl font-extrabold mb-2">Thank you!</h1>
        <h2 className="text-2xl">You successfully sent</h2>
        <div className="p-2 rounded-md text-primary mt-5 text-4xl font-bold">
          ${amount}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
