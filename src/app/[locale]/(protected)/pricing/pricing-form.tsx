"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Stripe Plans >> fill in your own priceId & link
export const plans = [
  {
    id: "weekly",
    link:
      process.env.NODE_ENV === "development"
        ? "https://buy.stripe.com/test_5kA3fhgIK5cw46s28a"
        : "",
    priceId:
      process.env.NODE_ENV === "development"
        ? "price_1PYoTtRtOqDuJSqudHYIZshR"
        : "",
    price: 69,

    duration: "/week",
  },
  {
    id: "monthly",
    link:
      process.env.NODE_ENV === "development"
        ? "https://buy.stripe.com/test_8wM1792RU7kE0Ug6op"
        : "",
    priceId:
      process.env.NODE_ENV === "development"
        ? "price_1PYoWhRtOqDuJSqu0pbz4nN6"
        : "",
    price: 236,

    duration: "/month",
  },
  {
    id: "one-time",
    link:
      process.env.NODE_ENV === "development"
        ? "https://buy.stripe.com/test_dR67vx0JM34ocCY6or"
        : "",
    priceId:
      process.env.NODE_ENV === "development"
        ? "price_1PYtKPRtOqDuJSquZtgseaJR"
        : "",
    price: 79,
    duration: "/session",
  },
];

const PricingForm = () => {
  const { data: session } = useSession();
  const [plan, setPlan] = useState(plans[0]);

  return (
    <>
      <Card className="md:w-[600px]">
        <CardHeader>
          <p className="font-medium text-primary mb-5 text-center">Pricing</p>
          <p className="text-2xl font-semibold text-center">
            {" "}
            Zakina Membership
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
            <div className=" w-full max-w-lg">
              <div className="relative flex flex-col h-full gap-5 lg:gap-8 z-10 bg-base-100 p-8 rounded-xl  ">
                <div className="flex justify-between items-center flex-wrap">
                  <div
                    className="flex items-center gap-2 "
                    onClick={() => setPlan(plans[0])}
                  >
                    <input
                      type="radio"
                      name="weekly"
                      className="radio"
                      checked={plan.id === "weekly"}
                    />
                    <span>Pay weekly</span>
                  </div>
                  <div
                    className="flex items-center gap-2 "
                    onClick={() => setPlan(plans[1])}
                  >
                    <input
                      type="radio"
                      name="monthly"
                      className="radio"
                      checked={plan.id === "monthly"}
                    />
                    <span>Pay monthly (Save $40 per month 💰)</span>
                  </div>
                  <div
                    className="flex items-center gap-2 "
                    onClick={() => setPlan(plans[2])}
                  >
                    <input
                      type="radio"
                      name="one-time"
                      className="radio"
                      checked={plan.id === "one-time"}
                    />
                    <span>Buy a single session</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <p className={`text-5xl tracking-tight font-extrabold`}>
                    ${plan.price}
                  </p>
                  <div className="flex flex-col justify-end mb-[4px]">
                    <p className="text-sm tracking-wide text-base-content/80 uppercase font-semibold">
                      {plan.duration}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 leading-relaxed text-base flex-1">
                  {[
                    {
                      name: "NextJS boilerplate",
                    },
                    { name: "User oauth" },
                    { name: "Database" },
                    { name: "Emails" },
                    { name: "1 year of updates" },
                    { name: "24/7 support" },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-[18px] h-[18px] opacity-80 shrink-0"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span>{feature.name} </span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2">
                  <Button>
                    <a
                      target="_blank"
                      href={
                        plan.link + "?prefilled_email=" + session?.user?.email
                      }
                    >
                      {plan.id === "one-time"
                        ? "Buy single session"
                        : "Subscribe"}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PricingForm;
