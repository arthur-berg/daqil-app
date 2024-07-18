import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isClient, isAdmin } = await getCurrentRole();

  if (!isClient && !isAdmin) {
    redirect("/unauthorized");
  }

  return children;
}
