import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  try {
    const { amount, appointmentId } = await request.json();
    const user = await getCurrentUser();
    let customerId = user?.stripeCustomerId;

    if (!user?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user?.id, {
        stripeCustomerId: customerId,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        appointmentId: appointmentId,
      },
    });

    const customerSession = await stripe.customerSessions.create({
      customer: customerId,
      components: {
        payment_element: {
          enabled: true,
          features: {
            payment_method_redisplay: "enabled",
            payment_method_save: "enabled",
            payment_method_save_usage: "off_session",
            payment_method_remove: "enabled",
          },
        },
      },
    });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    if (
      paymentMethods?.data.length > 0 &&
      user?.stripePaymentMethodId &&
      user?.stripeCustomerId
    ) {
      return NextResponse.json({
        savedPaymentMethods: paymentMethods.data,
        clientSecret: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
      });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
    });
  } catch (error) {
    console.error("Internal Error: ", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error}` },
      { status: 500 }
    );
  }
}
