import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { formatDateTime } from "@/lib/constants";
import { MarkAllRead } from "./mark-all-read";

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Thông báo
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unreadCount > 0
              ? `${unreadCount} thông báo chưa đọc`
              : "Không có thông báo mới"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllRead />}
      </div>

      <Card>
        <CardHeader
          title="Tất cả thông báo"
          action={<Bell className="h-4 w-4 text-zinc-400" />}
        />
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">
              Chưa có thông báo nào
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3 ${
                  n.read
                    ? "border-zinc-100 dark:border-zinc-800"
                    : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {n.title}
                    </p>
                    {!n.read && <Badge variant="info">Mới</Badge>}
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-500">{n.message}</p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
                {!n.read && (
                  <CheckCheck className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}