import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_VARIANTS,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AttendanceHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { range = "month" } = await searchParams;

  const now = new Date();
  let from: Date;

  if (range === "week") {
    const day = now.getDay() || 7;
    from = new Date(now);
    from.setDate(now.getDate() - day + 1);
  } else if (range === "all") {
    from = new Date(2000, 0, 1);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  from.setHours(0, 0, 0, 0);

  const [attendances, policy] = await Promise.all([
    prisma.attendance.findMany({
      where: { userId, date: { gte: from } },
      orderBy: { date: "desc" },
    }),
    prisma.policy.findFirst(),
  ]);

  const summary = {
    total: attendances.length,
    onTime: attendances.filter((a) => a.status === "ON_TIME").length,
    late: attendances.filter((a) => a.status === "LATE").length,
    earlyLeave: attendances.filter((a) => a.status === "EARLY_LEAVE").length,
    missing: attendances.filter((a) => a.status === "MISSING").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Lịch sử chấm công
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Theo dõi chi tiết giờ vào, giờ ra và trạng thái
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "week", label: "Tuần này" },
            { key: "month", label: "Tháng này" },
            { key: "all", label: "Tất cả" },
          ].map((r) => (
            <a
              key={r.key}
              href={`/dashboard/attendance?range=${r.key}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                range === r.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {r.label}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Tổng ngày làm" value={summary.total} />
        <SummaryCard label="Đúng giờ" value={summary.onTime} color="text-emerald-600" />
        <SummaryCard label="Đi muộn" value={summary.late} color="text-amber-600" />
        <SummaryCard label="Về sớm" value={summary.earlyLeave} color="text-orange-600" />
        <SummaryCard label="Thiếu công" value={summary.missing} color="text-red-600" />
      </div>

      <Card>
        <CardHeader
          title="Danh sách chấm công"
          description={`Khung giờ làm việc: ${policy?.workStart ?? "08:00"} - ${policy?.workEnd ?? "17:30"}`}
        />
        <CardContent className="overflow-x-auto p-0">
          {attendances.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Chưa có dữ liệu chấm công trong khoảng thời gian này
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Ngày</th>
                  <th className="px-5 py-3 font-medium">Giờ vào</th>
                  <th className="px-5 py-3 font-medium">Giờ ra</th>
                  <th className="px-5 py-3 font-medium">Số giờ</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => {
                  const hours = a.checkIn && a.checkOut
                    ? ((a.checkOut.getTime() - a.checkIn.getTime()) / 3600000).toFixed(1)
                    : null;
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                    >
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {formatDate(a.date)}
                      </td>
                      <td className="px-5 py-3">{formatTime(a.checkIn)}</td>
                      <td className="px-5 py-3">{formatTime(a.checkOut)}</td>
                      <td className="px-5 py-3">{hours ?? "—"}</td>
                      <td className="px-5 py-3">
                        <Badge variant={ATTENDANCE_STATUS_VARIANTS[a.status]}>
                          {ATTENDANCE_STATUS_LABELS[a.status]}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = "text-zinc-900 dark:text-zinc-50",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}