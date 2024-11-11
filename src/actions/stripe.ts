"use server";

import { getAppointmentTypeById } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { convertToSubcurrency } from "@/utils";
import { getLocale, getTranslations } from "next-intl/server";
import { checkDiscountCodeValidity } from "./discount-code";
import User from "@/models/User";
import CodeRedemption from "@/models/CodeRedemption";
import connectToMongoDB from "@/lib/mongoose";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (
  appointmentTypeId: string,
  appointmentId: string,
  discountCode?: string
) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const locale = await getLocale();
  try {
    requireAuth([UserRole.CLIENT]);
    const appointmentType = await getAppointmentTypeById(appointmentTypeId);

    // Validate and apply the discount code server-side
    let discountCodeError = null;
    let discountCodeSuccess = null;
    let finalAmount = appointmentType.price;
    let trackDiscountCodeRedeemed = false;
    let discountCodeId = null;
    if (discountCode) {
      const {
        error,
        success,
        discount,
        requiresTracking: track,
        discountCodeId: id,
      } = await checkDiscountCodeValidity(discountCode);
      if (error) {
        discountCodeError = error;
      }
      if (success) {
        discountCodeSuccess = SuccessMessages("discountCodeApplied");
        finalAmount = finalAmount - (finalAmount * discount) / 100;
        trackDiscountCodeRedeemed = track;
        discountCodeId = id;
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

    const metadata: Record<string, unknown> = {
      appointmentId: appointmentId,
      locale: locale,
    };

    if (trackDiscountCodeRedeemed && discountCodeId) {
      metadata["trackDiscountCodeRedeemed"] = trackDiscountCodeRedeemed;
      metadata["discountCodeId"] = discountCodeId.toString();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertToSubcurrency(finalAmount),
      currency: "usd",
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: metadata,
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
      return {
        finalAmount: finalAmount,
        discountCodeError: discountCodeError,
        discountCodeSuccess: discountCodeSuccess,
        savedPaymentMethods: paymentMethods.data,
        clientSecret: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
      };
    }

    return {
      finalAmount: finalAmount,
      discountCodeError: discountCodeError,
      discountCodeSuccess: discountCodeSuccess,
      clientSecret: paymentIntent.client_secret,
      customerSessionClientSecret: customerSession.client_secret,
    };
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};

export const createSetupIntent = async (appointmentId: string) => {
  await connectToMongoDB();
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
  const locale = await getLocale();

  try {
    // Require client authentication
    requireAuth([UserRole.CLIENT]);

    const user = await getCurrentUser();
    let customerId = user?.stripeCustomerId;

    // Create a Stripe customer if not already created
    if (!user?.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user?.id, {
        stripeCustomerId: customerId,
      });
    }

    // Create a SetupIntent to save the payment method
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        appointmentId: appointmentId,
        locale: locale,
      },
    });

    // Return the SetupIntent client secret
    return {
      clientSecret: setupIntent.client_secret,
    };
  } catch (error) {
    console.error("Internal Error: ", error);
    return {
      error: ErrorMessages("somethingWentWrong"),
    };
  }
};

export const chargeNoShowFee = async (
  customerId: string,
  paymentMethodId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
    });
    return { success: true, paymentIntent };
  } catch (error: any) {
    console.error("Error charging no-show fee:", error);
    return { error: "Something went wrong" };
  }
};
