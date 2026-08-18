import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  REQUEST_TYPE_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_VARIANTS,
  formatDate,
} from "@/lib/constants";
import { ApprovalActions } from "./approval-actions";

export default async function ApprovalsPage() {
  const session = await auth();
  const role = session!.user.role as string;
  const canApprove = ["SUPER_ADMIN", "HR_MANAGER", "LEADER"].includes(role);

  const [pending, approved] = await Promise.all([
    prisma.request.findMany({
      where: { status: "PENDING" },
      include: { user: { include: { department: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.request.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { user: { include: { department: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Phê duyệt đơn từ
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Xử lý đơn xin nghỉ phép, giải trình, công tác từ nhân viên
        </p>
      </div>

      <Card>
        <CardHeader
          title={`Đơn chờ duyệt (${pending.length})`}
          description="Cần xử lý theo thứ tự thời gian"
        />
        <CardContent className="overflow-x-auto p-0">
          {pending.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Không có đơn nào chờ duyệt
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Nhân viên</th>
                  <th className="px-5 py-3 font-medium">Loại đơn</th>
                  <th className="px-5 py-3 font-medium">Thời gian</th>
                  <th className="px-5 py-3 font-medium">Lý do</th>
                  <th className="px-5 py-3 font-medium">Ngày gửi</th>
                  <th className="px-5 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-50 last:border-0 align-top hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                  >
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">
                        {r.user.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {r.user.department?.name ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      {REQUEST_TYPE_LABELS[r.type]}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatDate(r.fromDate)} → {formatDate(r.toDate)}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-3 text-zinc-500">
                      {r.reason}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ApprovalActions id={r.id} disabled={!canApprove} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Đã xử lý gần đây" description="20 đơn gần nhất" />
        <CardContent className="overflow-x-auto p-0">
          {approved.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Chưa có đơn nào được xử lý
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-3 font-medium">Nhân viên</th>
                  <th className="px-5 py-3 font-medium">Loại đơn</th>
                  <th className="px-5 py-3 font-medium">Thời gian</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-800/50"
                  >
                    <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                      {r.user.name}
                    </td>
                    <td className="px-5 py-3">{REQUEST_TYPE_LABELS[r.type]}</td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatDate(r.fromDate)} → {formatDate(r.toDate)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={REQUEST_STATUS_VARIANTS[r.status]}>
                        {REQUEST_STATUS_LABELS[r.status]}
                      </Badge>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-3 text-zinc-500">
                      {r.approverNote ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}