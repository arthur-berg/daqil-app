import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function TherapistsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isClient } = await getCurrentRole();

  if (!isClient) {
    redirect("/unauthorized");
  }

  return children;
}
