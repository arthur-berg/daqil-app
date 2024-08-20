import { getCurrentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  const { amount } = await request.json();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    await stripe.paymentMethods.attach(user.stripePaymentMethodId, {
      customer: user.stripeCustomerId,
    });

    await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: user.stripeCustomerId,
      payment_method: user.stripePaymentMethodId,
      off_session: true,
      confirm: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Internal Error: ", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}

/*

Charge customers card later when user is not in checkut flow

try {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'sek',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {enabled: true},
    customer: '{{CUSTOMER_ID}}',
    payment_method: '{{PAYMENT_METHOD_ID}}',
    return_url: 'https://example.com/order/123/complete',
    off_session: true,
    confirm: true,
  });
} catch (err) {
  // Error code will be authentication_required if authentication is needed
  console.log('Error code is: ', err.code);
  const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
  console.log('PI retrieved: ', paymentIntentRetrieved.id);
}

DOCS: https://docs.stripe.com/payments/save-during-payment?platform=web&ui=elements#save-payment-methods

*/
