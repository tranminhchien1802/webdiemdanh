import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const policySchema = z.object({
  officeName: z.string().min(1).optional(),
  officeLat: z.number().optional(),
  officeLng: z.number().optional(),
  radiusMeters: z.number().min(10).optional(),
  workStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  workEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  graceMinutes: z.number().min(0).max(120).optional(),
  otRate: z.number().min(1).max(3).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const policy = await prisma.policy.findFirst();
  return NextResponse.json(policy);
}

export async function PATCH(request: Request) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  if (!role || !["SUPER_ADMIN", "HR_MANAGER"].includes(role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = policySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const policy = await prisma.policy.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  return NextResponse.json(policy);
}