import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShiftsManager } from "./shifts-manager";

export default async function ShiftsPage() {
  const session = await auth();
  const isSuperAdmin = session!.user.role === "SUPER_ADMIN";

  const shifts = await prisma.shift.findMany({
    include: { _count: { select: { schedules: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quản lý ca làm việc
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Thiết lập ca hành chính, ca gãy, ca xoay, ca đêm
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Thêm ca mới" />
            <CardContent>
              <ShiftsManager shifts={shifts} isSuperAdmin={isSuperAdmin} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader title={`Danh sách ca (${shifts.length})`} />
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3 font-medium">Tên ca</th>
                    <th className="px-5 py-3 font-medium">Giờ bắt đầu</th>
                    <th className="px-5 py-3 font-medium">Giờ kết thúc</th>
                    <th className="px-5 py-3 font-medium">Lịch đã xếp</th>
                    <th className="px-5 py-3 font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50"
                    >
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {s.name}
                      </td>
                      <td className="px-5 py-3">{s.startTime}</td>
                      <td className="px-5 py-3">{s.endTime}</td>
                      <td className="px-5 py-3 text-zinc-500">
                        {s._count.schedules}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={s.isActive ? "success" : "muted"}>
                          {s.isActive ? "Hoạt động" : "Tạm ngưng"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}