import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_VARIANTS,
} from "@/lib/constants";
import { RequestForm } from "./request-form";

export default async function RequestsPage() {
  const session = await auth();
  const requests = await prisma.request.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Đơn từ của tôi
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gửi đơn xin nghỉ phép, giải trình hoặc công tác và theo dõi trạng thái duyệt
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Gửi đơn mới" />
            <CardContent>
              <RequestForm />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="Danh sách đơn" description={`Tổng cộng ${requests.length} đơn`} />
            <CardContent className="overflow-x-auto p-0">
              {requests.length === 0 ? (
                <p className="py-12 text-center text-sm text-zinc-500">
                  Bạn chưa gửi đơn nào
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                      <th className="px-5 py-3 font-medium">Loại đơn</th>
                      <th className="px-5 py-3 font-medium">Thời gian</th>
                      <th className="px-5 py-3 font-medium">Lý do</th>
                      <th className="px-5 py-3 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                      >
                        <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                          {REQUEST_TYPE_LABELS[r.type]}
                        </td>
                        <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                          {formatDate(r.fromDate)} → {formatDate(r.toDate)}
                        </td>
                        <td className="max-w-[200px] truncate px-5 py-3 text-zinc-500">
                          {r.reason}
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant={REQUEST_STATUS_VARIANTS[r.status]}>
                            {REQUEST_STATUS_LABELS[r.status]}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {requests.some((r) => r.status !== "PENDING") && (
            <p className="mt-4 text-xs text-zinc-500">
              <Link href="/dashboard/attendance" className="underline">
                Xem lịch sử chấm công
              </Link>{" "}
              · Đơn đã duyệt sẽ được cập nhật vào chấm công tự động
            </p>
          )}
        </div>
      </div>
    </div>
  );
}