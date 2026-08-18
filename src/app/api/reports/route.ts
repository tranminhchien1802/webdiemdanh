import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!role || !["SUPER_ADMIN", "HR_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(url.searchParams.get("month") ?? new Date().getMonth() + 1);

  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  to.setHours(23, 59, 59, 999);

  const [users, attendances, policy] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: from, lte: to } },
      include: { user: true },
    }),
    prisma.policy.findFirst(),
  ]);

  const rows = users.map((user) => {
    const userAtt = attendances.filter((a) => a.userId === user.id);
    const present = userAtt.filter((a) => a.checkIn).length;
    const onTime = userAtt.filter((a) => a.status === "ON_TIME").length;
    const late = userAtt.filter((a) => a.status === "LATE").length;
    const early = userAtt.filter((a) => a.status === "EARLY_LEAVE").length;
    const missing = userAtt.filter((a) => a.status === "MISSING" || !a.checkIn).length;

    let totalHours = 0;
    for (const a of userAtt) {
      if (a.checkIn && a.checkOut) {
        totalHours += (a.checkOut.getTime() - a.checkIn.getTime()) / 3600000;
      }
    }

    return {
      name: user.name,
      email: user.email,
      department: user.department?.name ?? "—",
      position: user.position ?? "—",
      baseSalary: user.baseSalary,
      present,
      onTime,
      late,
      early,
      missing,
      totalHours: Math.round(totalHours * 10) / 10,
    };
  });

  return NextResponse.json({
    month,
    year,
    policy: policy ? { workStart: policy.workStart, workEnd: policy.workEnd, otRate: policy.otRate } : null,
    rows,
  });
}