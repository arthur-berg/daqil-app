import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { NextIntlClientProvider } from "next-intl";

export default function Home() {
  return (
    <NextIntlClientProvider>
      <main className="flex h-full flex-col items-center justify-center ">
        <div className="space-y-6 text-center">
          <h1 className="text-6xl font-semibold text-white drop-shadow-md">
            Zakina
          </h1>
          <h2 className="font-semibold text-white drop-shadow-md text-2xl">
            Get started
          </h2>
          <div className="flex space-x-4">
            <LoginButton>
              <Button variant="secondary" size="lg">
                Log in
              </Button>
            </LoginButton>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </NextIntlClientProvider>
  );
}
