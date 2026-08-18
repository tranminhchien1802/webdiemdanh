import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findUnique({
    where: {
      userId_date: { userId: session.user.id, date: todayStart },
    },
  });

  return NextResponse.json(
    attendance
      ? {
          checkIn: attendance.checkIn?.toISOString(),
          checkOut: attendance.checkOut?.toISOString(),
          status: attendance.status,
        }
      : null
  );
}