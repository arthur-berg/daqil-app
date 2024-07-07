"use client";

import { useRouter } from "@/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";

type LoginButtonProps = {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
  locale?: string;
};

export const LoginButton = ({
  children,
  mode = "redirect",
  asChild,
}: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push("/auth/login");
  };

  if (mode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="p-0 w-auto bg-transparent border-none">
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="cursor-pointer" onClick={onClick}>
      {children}
    </div>
  );
};
