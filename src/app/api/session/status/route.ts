import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ valid: false });
  }
  return NextResponse.json({ valid: true, email: session.user.email });
}