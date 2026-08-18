import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const requestSchema = z.object({
  type: z.enum([
    "LEAVE_PAID",
    "LEAVE_UNPAID",
    "MISSING_ATTENDANCE",
    "LATE_EARLY",
    "BUSINESS_TRIP",
  ]),
  fromDate: z.string().min(1),
  toDate: z.string().min(1),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { type, fromDate, toDate, reason } = parsed.data;
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  if (to < from) {
    return NextResponse.json(
      { error: "Ngày kết thúc phải sau ngày bắt đầu" },
      { status: 400 }
    );
  }

  const req = await prisma.request.create({
    data: {
      userId: session.user.id,
      type,
      fromDate: from,
      toDate: to,
      reason,
    },
  });

  return NextResponse.json({ id: req.id }, { status: 201 });
}