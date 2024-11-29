import { SetupForm } from "@/components/auth/setup-form";
import { getUserByEmail } from "@/data/user";

const SetupPage = async ({
  searchParams,
}: {
  searchParams: { token: string; email: string };
}) => {
  const token = searchParams.token;
  const email = searchParams.email;

  const user = await getUserByEmail(email);

  const role = user?.role;

  return <SetupForm role={role} emailParam={email} tokenParam={token} />;
};

export default SetupPage;
