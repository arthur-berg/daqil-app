"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signIn } from "next-auth/react";
import Link from "next/link";

// Customer portal link
const customerPortalLink =
  "https://billing.stripe.com/p/login/test_bIY5nI7yq8IXg2k5kk";

const CustomerPortalButton = () => {
  const user = useCurrentUser();

  return (
    <Link
      href={customerPortalLink + "?prefilled_email=" + user?.email}
      passHref
    >
      <Button>Billing</Button>
    </Link>
  );
};

export default CustomerPortalButton;
