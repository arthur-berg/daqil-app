import { LoginForm } from "@/components/auth/login-form";
import connectToMongoDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

const LoginPage = async () => {
  await connectToMongoDB();

  const session = await auth();

  console.log("session", session);

  if (!!session) {
    redirect("/book-appointment");
  }
  return (
    <div className="h-full flex items-center justify-center container">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
