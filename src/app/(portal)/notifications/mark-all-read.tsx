"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck } from "lucide-react";

export function MarkAllRead() {
  const router = useRouter();

  const handle = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      if (res.ok) {
        toast.success("Đã đánh dấu tất cả là đã đọc");
        router.refresh();
      }
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      <CheckCheck className="h-4 w-4" />
      Đánh dấu đã đọc
    </button>
  );
}