import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants";
import { ReportViewer } from "./report-viewer";

export default async function ReportsPage() {
  const session = await auth();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: { department: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Tổng hợp công & báo cáo
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tự động tổng hợp ngày công, giờ làm, vi phạm phục vụ tính lương
        </p>
      </div>

      <Card>
        <CardHeader
          title="Báo cáo chấm công"
          description="Chọn kỳ báo cáo và xuất dữ liệu theo tháng"
        />
        <CardContent>
          <ReportViewer users={users} defaultMonth={month} defaultYear={year} />
        </CardContent>
      </Card>
    </div>
  );
}