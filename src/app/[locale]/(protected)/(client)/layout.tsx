import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";

export default async function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToMongoDB();

  const { isTherapist, isAdmin } = await getCurrentRole();

  if (isTherapist) {
    redirect("/therapist/appointments");
  }

  if (isAdmin) {
    redirect("/admin");
  }
  return children;
}
