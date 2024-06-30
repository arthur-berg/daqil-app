import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Navbar } from "@/app/(protected)/_components/navbar";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="h-full w-full flex flex-col gap-y-10 items-center justify-center bg-background">
        <Navbar />
        {children}
      </div>
    </SessionProvider>
  );
}
