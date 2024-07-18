import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAdmin } = await getCurrentRole();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return <div className="flex justify-center">{children}</div>;
}
