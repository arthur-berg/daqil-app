import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToMongoDB();

  const { isAdmin } = await getCurrentRole();

  if (!isAdmin) {
    redirect("/unauthorized");
  }

  return <div className="flex justify-center">{children}</div>;
}
