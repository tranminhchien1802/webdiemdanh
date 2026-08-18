"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { TrendingUp } from "lucide-react";

type Policy = {
  officeName: string;
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
  workStart: string;
  workEnd: string;
  graceMinutes: number;
  otRate: number;
};

export function PolicyForm({
  policy,
  isSuperAdmin,
}: {
  policy: Policy;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<Policy>({ ...policy });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeName: form.officeName,
          officeLat: Number(form.officeLat),
          officeLng: Number(form.officeLng),
          radiusMeters: Number(form.radiusMeters),
          workStart: form.workStart,
          workEnd: form.workEnd,
          graceMinutes: Number(form.graceMinutes),
          otRate: Number(form.otRate),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success("Đã lưu chính sách");
      router.refresh();
    } catch {
      toast.error("Không thể lưu chính sách");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tên văn phòng
          </label>
          <Input
            value={form.officeName}
            onChange={(e) => setForm({ ...form, officeName: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Vĩ độ (Latitude)
          </label>
          <Input
            type="number"
            step="0.0001"
            value={form.officeLat}
            onChange={(e) => setForm({ ...form, officeLat: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Kinh độ (Longitude)
          </label>
          <Input
            type="number"
            step="0.0001"
            value={form.officeLng}
            onChange={(e) => setForm({ ...form, officeLng: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Bán kính cho phép (mét)
          </label>
          <Input
            type="number"
            value={form.radiusMeters}
            onChange={(e) => setForm({ ...form, radiusMeters: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Giờ bắt đầu làm việc
          </label>
          <Input
            type="time"
            value={form.workStart}
            onChange={(e) => setForm({ ...form, workStart: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Giờ kết thúc làm việc
          </label>
          <Input
            type="time"
            value={form.workEnd}
            onChange={(e) => setForm({ ...form, workEnd: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Grace period (phút) - cho phép đi muộn
          </label>
          <Input
            type="number"
            min={0}
            max={120}
            value={form.graceMinutes}
            onChange={(e) => setForm({ ...form, graceMinutes: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Hệ số tăng ca (OT rate)
          </label>
          <Input
            type="number"
            step="0.1"
            min={1}
            max={3}
            value={form.otRate}
            onChange={(e) => setForm({ ...form, otRate: Number(e.target.value) })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || !isSuperAdmin}
        className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        <TrendingUp className="h-4 w-4" />
        {submitting ? "Đang lưu..." : "Lưu chính sách"}
      </button>
      {!isSuperAdmin && (
        <p className="text-xs text-zinc-500">
          Chỉ Super Admin mới được sửa chính sách
        </p>
      )}
    </form>
  );
}