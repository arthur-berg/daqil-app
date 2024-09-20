import SettingsForm from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
/* import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createStripeAccountLink = async (userId: string) => {
  let user = await User.findById(userId);

  if (!user.stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
    });
    user.stripeAccountId = account.id;
    await user.save();
  }

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    type: "account_onboarding",
  });

  return accountLink.url;
}; */

const TherapistSettingsPage = async () => {
  /*   const user = await getCurrentUser();
  if (!user) return "No user found"; */

  /*   const stripeLink = await createStripeAccountLink(user.id); */
  return <SettingsForm />;
};

/*   return (
    <>
      <div>
        {stripeLink ? (
          <a href={stripeLink} target="_blank">
            <Button>Complete Stripe Onboarding</Button>
          </a>
        ) : (
          <p>Loading Stripe Onboarding...</p>
        )}
      </div>
      <SettingsForm />
    </>
  ); */

export default TherapistSettingsPage;
