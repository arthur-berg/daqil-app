import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};
import connectToMongoDB from "@/lib/mongoose";

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default async function RootLayout({ children }: Props) {
  try {
    await connectToMongoDB();
    console.log("Mongo connected and cron jobs running for appointments");
  } catch {
    console.log("Mongo connection failed");
  }
  return children;
}
