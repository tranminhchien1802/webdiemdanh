"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  _count?: { schedules: number };
};

export function ShiftsManager({
  shifts,
  isSuperAdmin,
}: {
  shifts: Shift[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", startTime: "08:00", endTime: "17:30" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success("Đã thêm ca làm việc");
      setForm({ name: "", startTime: "08:00", endTime: "17:30" });
      router.refresh();
    } catch {
      toast.error("Không thể lưu ca");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (s: Shift) => {
    try {
      const res = await fetch("/api/shifts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id, isActive: !s.isActive }),
      });
      if (!res.ok) {
        toast.error("Có lỗi xảy ra");
        return;
      }
      toast.success(s.isActive ? "Đã tạm ngưng ca" : "Đã kích hoạt ca");
      router.refresh();
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tên ca
        </label>
        <Input
          placeholder="Ví dụ: Ca hành chính"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Bắt đầu
          </label>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Kết thúc
          </label>
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {submitting ? "Đang lưu..." : "Thêm ca"}
      </button>

      <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <p className="mb-3 text-xs font-medium text-zinc-500">Bật/tắt ca nhanh</p>
        <div className="space-y-2">
          {shifts.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {s.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {s.startTime} - {s.endTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(s)}
                disabled={!isSuperAdmin}
                className="disabled:opacity-40"
              >
                <Badge variant={s.isActive ? "success" : "muted"}>
                  {s.isActive ? "Đang mở" : "Đóng"}
                </Badge>
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}