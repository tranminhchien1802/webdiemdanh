import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, History, FileText, Wallet, ArrowRight } from "lucide-react";
import {
  formatDate,
  formatTime,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_VARIANTS,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_VARIANTS,
} from "@/lib/constants";

export default async function EmployeeDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayAttendance, monthAttendances, recentRequests, user] =
    await Promise.all([
      prisma.attendance.findUnique({
        where: {
          userId_date: { userId, date: todayStart },
        },
      }),
      prisma.attendance.findMany({
        where: { userId, date: { gte: startOfMonth } },
        orderBy: { date: "desc" },
      }),
      prisma.request.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);

  const presentDays = monthAttendances.length;
  const onTimeCount = monthAttendances.filter((a) => a.status === "ON_TIME").length;
  const lateCount = monthAttendances.filter((a) => a.status === "LATE").length;
  const pendingRequests = await prisma.request.count({
    where: { userId, status: "PENDING" },
  });

  const stats = [
    { label: "Số ngày công trong tháng", value: presentDays, color: "text-emerald-600" },
    { label: "Ngày đúng giờ", value: onTimeCount, color: "text-sky-600" },
    { label: "Số lần đi muộn", value: lateCount, color: "text-amber-600" },
    { label: "Đơn đang chờ duyệt", value: pendingRequests, color: "text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Xin chào, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {formatDate(new Date())} · {user?.position ?? "Nhân viên"}
          </p>
        </div>
        <Link
          href="/dashboard/check-in"
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <KeyRound className="h-4 w-4" />
          Chấm công
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="py-5">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className={`mt-1 text-3xl font-semibold ${s.color}`}>
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Hôm nay" description="Trạng thái chấm công hiện tại" />
          <CardContent>
            {todayAttendance ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div>
                    <p className="text-xs text-zinc-500">Giờ vào</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatTime(todayAttendance.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Giờ ra</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatTime(todayAttendance.checkOut)}
                    </p>
                  </div>
                  <Badge
                    variant={ATTENDANCE_STATUS_VARIANTS[todayAttendance.status]}
                  >
                    {ATTENDANCE_STATUS_LABELS[todayAttendance.status]}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-500">
                  Hôm nay bạn chưa chấm công
                </p>
                <Link
                  href="/dashboard/check-in"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <KeyRound className="h-4 w-4" />
                  Chấm công ngay
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Đơn từ gần đây"
            description="3 đơn mới nhất của bạn"
            action={
              <Link
                href="/dashboard/requests"
                className="flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              >
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <CardContent className="space-y-3">
            {recentRequests.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-500">
                Chưa có đơn từ nào
              </p>
            ) : (
              recentRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {REQUEST_TYPE_LABELS[r.type]}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatDate(r.fromDate)} → {formatDate(r.toDate)}
                    </p>
                  </div>
                  <Badge variant={REQUEST_STATUS_VARIANTS[r.status]}>
                    {REQUEST_STATUS_LABELS[r.status]}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/dashboard/attendance", icon: History, label: "Lịch sử chấm công" },
          { href: "/dashboard/requests", icon: FileText, label: "Gửi đơn từ" },
          { href: "/dashboard/payslips", icon: Wallet, label: "Xem bảng lương" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <item.icon className="h-5 w-5 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}