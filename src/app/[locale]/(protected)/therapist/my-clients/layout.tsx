import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function TherapistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
      {children}
    </div>
  );
}
