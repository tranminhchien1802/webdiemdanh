import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const genSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!role || !["SUPER_ADMIN", "HR_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = genSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { month, year } = parsed.data;
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  to.setHours(23, 59, 59, 999);

  const [users, attendances, policy] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true, role: { in: ["EMPLOYEE", "LEADER"] } },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: from, lte: to } },
    }),
    prisma.policy.findFirst(),
  ]);

  const otRate = policy?.otRate ?? 1.5;
  const workHoursPerDay = 8;

  const results: { email: string; total: number }[] = [];

  for (const user of users) {
    const userAtt = attendances.filter((a) => a.userId === user.id);
    const present = userAtt.filter((a) => a.checkIn).length;

    let otHours = 0;
    for (const a of userAtt) {
      if (a.checkIn && a.checkOut) {
        const hours = (a.checkOut.getTime() - a.checkIn.getTime()) / 3600000;
        if (hours > workHoursPerDay) {
          otHours += hours - workHoursPerDay;
        }
      }
    }

    const dailyRate = user.baseSalary / 26;
    const base = dailyRate * present;
    const overtimePay = Math.round(dailyRate / workHoursPerDay * otHours * otRate);
    const insurance = Math.round(user.baseSalary * 0.105);
    const total = Math.round(base + overtimePay - insurance);

    await prisma.payslip.upsert({
      where: {
        userId_month_year: { userId: user.id, month, year },
      },
      update: {
        baseSalary: base,
        allowance: 0,
        overtimePay,
        deduction: 0,
        insurance,
        total,
      },
      create: {
        userId: user.id,
        month,
        year,
        baseSalary: base,
        allowance: 0,
        overtimePay,
        deduction: 0,
        insurance,
        total,
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Bảng lương đã có",
        message: `Bảng lương tháng ${month}/${year} đã được công bố. Vui lòng kiểm tra trong mục Bảng lương.`,
        type: "PAYSLIP",
      },
    });

    results.push({ email: user.email, total });
  }

  return NextResponse.json({ count: results.length, results });
}