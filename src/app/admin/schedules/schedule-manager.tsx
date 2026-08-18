"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Select } from "@/components/ui/input";

type Employee = {
  id: string;
  name: string;
  department?: { name: string } | null;
};

type Shift = { id: string; name: string };

export function ScheduleManager({
  employees,
  shifts,
}: {
  employees: Employee[];
  shifts: Shift[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ userId: "", shiftId: "", date: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.shiftId || !form.date) {
      toast.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success("Đã xếp lịch cho nhân viên");
      setForm({ userId: "", shiftId: "", date: "" });
      router.refresh();
    } catch {
      toast.error("Không thể xếp lịch");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nhân viên
        </label>
        <Select
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
        >
          <option value="">Chọn nhân viên</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} {emp.department ? `(${emp.department.name})` : ""}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Ca làm việc
        </label>
        <Select
          value={form.shiftId}
          onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
        >
          <option value="">Chọn ca</option>
          {shifts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Ngày làm việc
        </label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-10 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {submitting ? "Đang xếp..." : "Xếp lịch"}
      </button>
    </form>
  );
}