import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";
import connectToMongoDB from "@/lib/mongoose";

export default async function TherapistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await connectToMongoDB();

  const { isTherapist, isAdmin } = await getCurrentRole();

  if (!isTherapist && !isAdmin) {
    redirect("/unauthorized");
  }

  return children;
}
