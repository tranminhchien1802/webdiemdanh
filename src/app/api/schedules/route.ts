import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scheduleSchema = z.object({
  userId: z.string().min(1),
  shiftId: z.string().min(1),
  date: z.string().min(1),
});

function isAdmin(role?: string) {
  return role === "SUPER_ADMIN" || role === "HR_MANAGER";
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  const schedules = await prisma.schedule.findMany({
    where: { date: { gte: monthStart, lte: monthEnd } },
    include: { user: true, shift: true },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = scheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { userId, shiftId, date } = parsed.data;
  const parsedDate = new Date(`${date}T00:00:00`);

  const existing = await prisma.schedule.findUnique({
    where: { userId_date: { userId, date: parsedDate } },
  });

  if (existing) {
    const updated = await prisma.schedule.update({
      where: { id: existing.id },
      data: { shiftId },
    });
    return NextResponse.json(updated);
  }

  const schedule = await prisma.schedule.create({
    data: { userId, shiftId, date: parsedDate },
  });

  return NextResponse.json(schedule, { status: 201 });
}