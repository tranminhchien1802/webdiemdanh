import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Timer, TrendingUp, Building2 } from "lucide-react";
import { PolicyForm } from "./policy-form";

export default async function PoliciesPage() {
  const session = await auth();
  const isSuperAdmin = session!.user.role === "SUPER_ADMIN";

  const policy = await prisma.policy.findFirst();

  if (!policy) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Chính sách chấm công
        </h1>
        <Card>
          <CardContent className="py-12 text-center text-sm text-zinc-500">
            Chưa có chính sách. Hãy tạo chính sách đầu tiên.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Chính sách chấm công
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Cấu hình văn phòng, khung giờ làm việc và quy tắc tính công
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PolicyInfoCard
          icon={Building2}
          label="Văn phòng"
          value={policy.officeName}
        />
        <PolicyInfoCard
          icon={MapPin}
          label="Tọa độ chấm công"
          value={`${policy.officeLat.toFixed(4)}, ${policy.officeLng.toFixed(4)}`}
        />
        <PolicyInfoCard
          icon={Timer}
          label="Bán kính cho phép"
          value={`${policy.radiusMeters}m`}
        />
        <PolicyInfoCard
          icon={Clock}
          label="Khung giờ làm việc"
          value={`${policy.workStart} - ${policy.workEnd}`}
        />
      </div>

      <Card>
        <CardHeader
          title="Cấu hình chính sách"
          description="Thay đổi các quy tắc áp dụng cho toàn công ty"
          action={<Badge variant="info">Grace: {policy.graceMinutes} phút</Badge>}
        />
        <CardContent>
          <PolicyForm policy={policy} isSuperAdmin={isSuperAdmin} />
        </CardContent>
      </Card>
    </div>
  );
}

function PolicyInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}