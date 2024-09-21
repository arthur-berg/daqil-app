import { checkDiscountCodeValidity } from "@/actions/discount-code";
import { getAppointmentTypeById } from "@/data/appointment-types";
import { getCurrentUser } from "@/lib/auth";
import DiscountCode from "@/models/DiscountCode";
import User from "@/models/User";
import { convertToSubcurrency } from "@/utils";
import { getTranslations } from "next-intl/server";
import { NextRequest, NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export async function POST(request: NextRequest) {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  try {
    const { appointmentTypeId, appointmentId, discountCode } =
      await request.json();

    const appointmentType = await getAppointmentTypeById(appointmentTypeId);

    // Validate and apply the discount code server-sideds
    let discountCodeError = null;
    let discountCodeSuccess = null;
    let finalAmount = convertToSubcurrency(appointmentType.price);
    if (discountCode) {
      const { error, success, discount } = await checkDiscountCodeValidity(
        discountCode
      );
      if (error) {
        discountCodeError = error;
      }
      if (success) {
        discountCodeSuccess = success;
        finalAmount = finalAmount - (finalAmount * discount) / 100;
      }
    }

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
      amount: finalAmount,
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
        discountCodeError: discountCodeError,
        discountCodeSuccess: discountCodeSuccess,
        savedPaymentMethods: paymentMethods.data,
        clientSecret: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
      });
    }

    return NextResponse.json({
      discountCodeError: discountCodeError,
      discountCodeSuccess: discountCodeSuccess,
      clientSecret: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
    });
  } catch (error) {
    console.error("Internal Error: ", error);
    return NextResponse.json(
      { error: ErrorMessages("somethingWentWrong") },
      { status: 500 }
    );
  }
}
