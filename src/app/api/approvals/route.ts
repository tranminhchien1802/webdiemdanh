import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const decisionSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["approve", "reject"]),
  note: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const role = session.user.role as string;
  const canApprove = ["SUPER_ADMIN", "HR_MANAGER", "LEADER"].includes(role);
  if (!canApprove) {
    return NextResponse.json({ error: "Không có quyền phê duyệt" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = decisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { id, action, note } = parsed.data;
  const status = action === "approve" ? "APPROVED" : "REJECTED";

  const req = await prisma.request.update({
    where: { id },
    data: {
      status,
      approverId: session.user.id,
      approverNote: note ?? null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: req.userId,
      title: action === "approve" ? "Đơn đã được duyệt" : "Đơn bị từ chối",
      message: action === "approve"
        ? `Đơn ${req.type} của bạn đã được phê duyệt.`
        : `Đơn ${req.type} của bạn đã bị từ chối${note ? `: ${note}` : ""}.`,
      type: action === "approve" ? "APPROVED" : "REJECTED",
    },
  });

  return NextResponse.json(req);
}