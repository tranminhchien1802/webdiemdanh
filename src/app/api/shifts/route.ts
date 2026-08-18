import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const shiftSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isActive: z.boolean().optional(),
});

function isAdmin(role?: string) {
  return role === "SUPER_ADMIN" || role === "HR_MANAGER";
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const shifts = await prisma.shift.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(shifts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const parsed = shiftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const shift = await prisma.shift.create({ data: parsed.data });
  return NextResponse.json(shift, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const { id, ...data } = body ?? {};
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }
  const parsed = shiftSchema.partial().safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const shift = await prisma.shift.update({ where: { id }, data: parsed.data });
  return NextResponse.json(shift);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const { id } = body ?? {};
  if (!id) {
    return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  }
  await prisma.shift.delete({ where: { id } });
  return NextResponse.json({ success: true });
}