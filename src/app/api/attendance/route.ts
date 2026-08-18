import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  action: z.enum(["check-in", "check-out"]),
  pin: z.string().regex(/^\d{6}$/, "Mã PIN gồm 6 chữ số"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { action, pin } = parsed.data;
  const userId = session.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });
  }

  if (user.pin !== pin) {
    return NextResponse.json({ error: "Mã PIN không đúng" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [policy, attendance] = await Promise.all([
    prisma.policy.findFirst(),
    prisma.attendance.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    }),
  ]);

  if (!policy) {
    return NextResponse.json({ error: "Chưa cấu hình chính sách" }, { status: 500 });
  }

  if (action === "check-in") {
    if (attendance?.checkIn) {
      return NextResponse.json({ error: "Hôm nay bạn đã chấm công vào rồi" }, { status: 400 });
    }

    const [h, m] = policy.workStart.split(":").map(Number);
    const workStart = new Date();
    workStart.setHours(h, m, 0, 0);
    const graceEnd = new Date(workStart.getTime() + policy.graceMinutes * 60000);

    const status = now > graceEnd ? "LATE" : "ON_TIME";

    await prisma.attendance.upsert({
      where: { userId_date: { userId, date: todayStart } },
      update: { checkIn: now, status },
      create: {
        userId,
        date: todayStart,
        checkIn: now,
        status,
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Chấm công thành công",
        message: `Bạn đã check-in lúc ${now.toLocaleTimeString("vi-VN")}.`,
        type: "CHECK_IN",
      },
    });

    return NextResponse.json({
      success: true,
      time: now.toISOString(),
      status,
    });
  }

  if (action === "check-out") {
    if (!attendance?.checkIn) {
      return NextResponse.json({ error: "Hôm nay bạn chưa chấm công vào" }, { status: 400 });
    }
    if (attendance.checkOut) {
      return NextResponse.json({ error: "Hôm nay bạn đã chấm công ra rồi" }, { status: 400 });
    }

    const [h, m] = policy.workEnd.split(":").map(Number);
    const workEnd = new Date();
    workEnd.setHours(h, m, 0, 0);

    const status = now < workEnd ? "EARLY_LEAVE" : attendance.status;

    await prisma.attendance.update({
      where: { id: attendance.id },
      data: { checkOut: now, status },
    });

    return NextResponse.json({
      success: true,
      time: now.toISOString(),
      status,
    });
  }

  return NextResponse.json({ error: "Hành động không hợp lệ" }, { status: 400 });
}