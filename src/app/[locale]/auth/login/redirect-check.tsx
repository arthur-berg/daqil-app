import connectToMongoDB from "@/lib/mongoose";
import { auth } from "@/auth";
import { redirect } from "@/navigation";

const RedirectCheck = async () => {
  await connectToMongoDB();

  const session = await auth();

  if (!!session) {
    redirect("/book-appointment");
  }
  return null;
};

export default RedirectCheck;
