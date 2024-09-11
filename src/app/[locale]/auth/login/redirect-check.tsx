import connectToMongoDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

const RedirectCheck = async () => {
  await connectToMongoDB();

  const session = await auth();

  console.log("session", session);

  if (!!session) {
    redirect("/book-appointment");
  }
  return <div>RedirectCheck</div>;
};

export default RedirectCheck;
