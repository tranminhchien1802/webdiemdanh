"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ApprovalActions({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const decide = async (action: "approve" | "reject") => {
    setLoading(action);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success(action === "approve" ? "Đã duyệt đơn" : "Đã từ chối đơn");
      setNote("");
      router.refresh();
    } catch {
      toast.error("Không thể xử lý đơn");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ghi chú (tùy chọn)"
        className="h-9 w-40"
      />
      <button
        onClick={() => decide("approve")}
        disabled={disabled || loading !== null}
        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" />
        {loading === "approve" ? "..." : "Duyệt"}
      </button>
      <button
        onClick={() => decide("reject")}
        disabled={disabled || loading !== null}
        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
      >
        <X className="h-3.5 w-3.5" />
        {loading === "reject" ? "..." : "Từ chối"}
      </button>
    </div>
  );
}