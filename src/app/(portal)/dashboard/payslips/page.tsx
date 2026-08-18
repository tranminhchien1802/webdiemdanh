import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/constants";

export default async function PayslipsPage() {
  const session = await auth();
  const payslips = await prisma.payslip.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const latest = payslips[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Bảng lương của tôi
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Chi tiết lương cơ bản, phụ cấp, tăng ca và khấu trừ theo tháng
        </p>
      </div>

      {latest ? (
        <>
          <Card>
            <CardHeader
              title={`Lương tháng ${latest.month}/${latest.year}`}
              description="Bảng lương mới nhất"
              action={
                <Badge variant="success">
                  Tổng nhận: {formatCurrency(latest.total)}
                </Badge>
              }
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <PayslipItem label="Lương cơ bản" value={latest.baseSalary} />
                <PayslipItem label="Phụ cấp" value={latest.allowance} />
                <PayslipItem label="Tiền tăng ca" value={latest.overtimePay} />
                <PayslipItem label="Bảo hiểm" value={latest.insurance} negative />
                <PayslipItem label="Khấu trừ" value={latest.deduction} negative />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Lịch sử bảng lương" />
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
                    <th className="px-5 py-3 font-medium">Kỳ lương</th>
                    <th className="px-5 py-3 font-medium">Lương cơ bản</th>
                    <th className="px-5 py-3 font-medium">Tăng ca</th>
                    <th className="px-5 py-3 font-medium">Khấu trừ</th>
                    <th className="px-5 py-3 font-medium">Thực nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                    >
                      <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                        {p.month}/{p.year}
                      </td>
                      <td className="px-5 py-3">{formatCurrency(p.baseSalary)}</td>
                      <td className="px-5 py-3">{formatCurrency(p.overtimePay)}</td>
                      <td className="px-5 py-3">
                        {formatCurrency(p.deduction + p.insurance)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-emerald-600">
                        {formatCurrency(p.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-zinc-500">
              Chưa có bảng lương nào được công bố
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Bảng lương sẽ xuất hiện ở đây sau khi được bộ phận nhân sự tổng hợp
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PayslipItem({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          negative
            ? "text-red-600"
            : "text-zinc-900 dark:text-zinc-50"
        }`}
      >
        {negative ? "-" : ""}
        {formatCurrency(value)}
      </p>
    </div>
  );
}