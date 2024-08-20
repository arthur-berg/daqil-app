import { getCurrentRole } from "@/lib/auth";
import { redirect } from "@/navigation";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-3xl bg-white mx-auto p-8 rounded-md w-full">
      {children}
    </div>
  );
}
