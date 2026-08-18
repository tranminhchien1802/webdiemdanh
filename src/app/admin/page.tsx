import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  AlertTriangle,
  FileClock,
  CalendarClock,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/constants";
import { AttendanceChart } from "./attendance-chart";
import { DepartmentChart } from "./department-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [totalEmployees, activeToday, pendingRequests, departments, monthAttendances, recentRequests, employees] =
    await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.attendance.count({ where: { date: todayStart, checkIn: { not: null } } }),
      prisma.request.count({ where: { status: "PENDING" } }),
      prisma.department.findMany({ include: { _count: { select: { users: true } } } }),
      prisma.attendance.findMany({
        where: { date: { gte: monthStart } },
        include: { user: true },
      }),
      prisma.request.findMany({
        where: { status: "PENDING" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.findMany({ where: { isActive: true }, include: { department: true } }),
    ]);

  const lateToday = monthAttendances.filter((a) => a.status === "LATE").length;
  const onTimeToday = monthAttendances.filter((a) => a.status === "ON_TIME").length;

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartData = last14Days.map((d) => {
    const dayAtt = monthAttendances.filter(
      (a) => a.date.toDateString() === d.toDateString()
    );
    const present = dayAtt.filter((a) => a.checkIn).length;
    const late = dayAtt.filter((a) => a.status === "LATE").length;
    return {
      date: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      present,
      late,
    };
  });

  const deptData = departments.map((dep) => ({
    name: dep.name,
    value: dep._count.users,
  }));

  const stats = [
    { label: "Tổng nhân sự", value: totalEmployees, icon: Users, color: "text-sky-600" },
    { label: "Đi làm hôm nay", value: activeToday, icon: UserCheck, color: "text-emerald-600" },
    { label: "Đơn chờ duyệt", value: pendingRequests, icon: FileClock, color: "text-amber-600" },
    { label: "Đi muộn tháng này", value: lateToday, icon: AlertTriangle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Bảng điều khiển quản trị
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tổng quan nhân sự · {formatDate(new Date())}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500">{s.label}</p>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`mt-1 text-3xl font-semibold ${s.color}`}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Đi làm 14 ngày gần nhất"
            description="Số lượng có mặt và đi muộn mỗi ngày"
          />
          <CardContent>
            <AttendanceChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Nhân sự theo phòng ban" />
          <CardContent>
            <DepartmentChart data={deptData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Đơn chờ duyệt" description="Cần xử lý gần nhất" />
          <CardContent className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                Không có đơn nào chờ duyệt
              </p>
            ) : (
              recentRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {r.user.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {r.type} · {formatDate(r.fromDate)}
                    </p>
                  </div>
                  <Badge variant="warning">Chờ duyệt</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Nhân viên mới tham gia" description="Danh sách nhân sự" />
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Nhân viên</th>
                  <th className="px-5 py-3 font-medium">Phòng ban</th>
                  <th className="px-5 py-3 font-medium">Chức vụ</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {e.name}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {e.department?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">{e.position ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}