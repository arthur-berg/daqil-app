"use server";

import { getAppointmentTypeById } from "@/data/appointment-types";
import { UserRole } from "@/generalTypes";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { convertToSubcurrency } from "@/utils";
import { getTranslations } from "next-intl/server";
import { checkDiscountCodeValidity } from "./discount-code";
import User from "@/models/User";
import CodeRedemption from "@/models/CodeRedemption";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (
  appointmentTypeId: string,
  appointmentId: string,
  discountCode?: string
) => {
  const [SuccessMessages, ErrorMessages] = await Promise.all([
    getTranslations("SuccessMessages"),
    getTranslations("ErrorMessages"),
  ]);
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
        console.log("discount", discount);
        discountCodeSuccess = SuccessMessages("discountCodeApplied");
        finalAmount = finalAmount - (finalAmount * discount) / 100;
        console.log("finalAmount", finalAmount);
        trackDiscountCodeRedeemed = track;
        discountCodeId = id;
        console.log("id", id);
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

    const metadata: Record<string, unknown> = { appointmentId: appointmentId };

    if (trackDiscountCodeRedeemed && discountCodeId) {
      metadata["trackDiscountCodeRedeemed"] = trackDiscountCodeRedeemed;
      metadata["discountCodeId"] = discountCodeId.toString();
    }

    console.log("metadata", metadata);

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
