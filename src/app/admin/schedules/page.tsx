import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/constants";
import { ScheduleManager } from "./schedule-manager";

export default async function SchedulesPage() {
  const session = await auth();

  const [employees, shifts, schedules] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true, role: { in: ["EMPLOYEE", "LEADER"] } },
      include: { department: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({ where: { isActive: true } }),
    prisma.schedule.findMany({
      include: { user: true, shift: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Xếp lịch làm việc
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Phân ca theo ngày cho từng nhân viên hoặc theo phòng ban
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Xếp ca" description="Chọn nhân viên, ngày và ca làm việc" />
          <CardContent>
            <ScheduleManager employees={employees} shifts={shifts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Lịch gần đây" description="50 lịch xếp mới nhất" />
          <CardContent className="overflow-x-auto p-0">
            {schedules.length === 0 ? (
              <p className="py-12 text-center text-sm text-zinc-500">
                Chưa có lịch làm việc nào
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3 font-medium">Nhân viên</th>
                    <th className="px-5 py-3 font-medium">Ngày</th>
                    <th className="px-5 py-3 font-medium">Ca</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50"
                    >
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {s.user.name}
                      </td>
                      <td className="px-5 py-3 text-zinc-500">{formatDate(s.date)}</td>
                      <td className="px-5 py-3">
                        <Badge variant="info">{s.shift.name}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}