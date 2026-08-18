import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_VARIANTS, formatDate } from "@/lib/constants";
import { EmployeesTable } from "./employees-table";

export default async function EmployeesPage() {
  const session = await auth();
  const isSuperAdmin = session!.user.role === "SUPER_ADMIN";

  const [employees, departments] = await Promise.all([
    prisma.user.findMany({
      include: { department: true, _count: { select: { attendances: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Quản lý nhân sự
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Hồ sơ nhân sự, phân quyền và thông tin chấm công
        </p>
      </div>

      <Card>
        <CardHeader
          title={`Danh sách nhân viên (${employees.length})`}
          description="Thêm mới hoặc chỉnh sửa hồ sơ nhân sự"
        />
        <CardContent className="overflow-x-auto p-0">
          <EmployeesTable
            employees={employees}
            departments={departments}
            isSuperAdmin={isSuperAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}