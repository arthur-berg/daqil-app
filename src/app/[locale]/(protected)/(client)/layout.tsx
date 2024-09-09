import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isTherapist, isAdmin } = await getCurrentRole();

  if (isTherapist) {
    redirect("/therapist/appointments");
  }

  if (isAdmin) {
    redirect("/admin");
  }
  return children;
}
