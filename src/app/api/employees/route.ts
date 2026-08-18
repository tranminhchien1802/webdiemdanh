import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePin } from "@/lib/pin";
import bcrypt from "bcryptjs";
import { z } from "zod";

const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  phone: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  role: z.enum(["SUPER_ADMIN", "HR_MANAGER", "LEADER", "EMPLOYEE"]),
  departmentId: z.string().optional().nullable(),
  baseSalary: z.number().optional(),
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

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = employeeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { name, email, password, role, departmentId, position, phone, baseSalary } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
  }

  const hashed = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      pin: generatePin(),
      role,
      departmentId: departmentId || null,
      position: position || null,
      phone: phone || null,
      baseSalary: baseSalary ?? 0,
    },
    include: { department: true },
  });

  return NextResponse.json(user, { status: 201 });
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

  if (data.resetPin) {
    const pin = generatePin();
    await prisma.user.update({ where: { id }, data: { pin } });
    return NextResponse.json({ id, pin });
  }

  const parsed = employeeSchema.partial().safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { password, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (rest.departmentId !== undefined) updateData.departmentId = rest.departmentId || null;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { department: true },
  });

  return NextResponse.json(user);
}