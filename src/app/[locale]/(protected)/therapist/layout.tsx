import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function TherapistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isTherapist, isAdmin } = await getCurrentRole();

  if (!isTherapist && !isAdmin) {
    redirect("/unauthorized");
  }

  return children;
}
