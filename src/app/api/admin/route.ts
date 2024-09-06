import { UserRole } from "@/generalTypes";
import { getCurrentRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import connectToMongoDB from "@/lib/mongoose";

export async function GET() {
  await connectToMongoDB();
  const { role } = await getCurrentRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, { status: 200 });
  }

  return new NextResponse(null, { status: 403 });
}
