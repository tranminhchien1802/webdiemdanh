"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Input, Select, Textarea } from "@/components/ui/input";

const requestSchema = z.object({
  type: z.enum([
    "LEAVE_PAID",
    "LEAVE_UNPAID",
    "MISSING_ATTENDANCE",
    "LATE_EARLY",
    "BUSINESS_TRIP",
  ]),
  fromDate: z.string().min(1, "Chọn ngày bắt đầu"),
  toDate: z.string().min(1, "Chọn ngày kết thúc"),
  reason: z.string().min(5, "Lý do phải có ít nhất 5 ký tự"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const TYPES = [
  { value: "LEAVE_PAID", label: "Nghỉ phép có lương" },
  { value: "LEAVE_UNPAID", label: "Nghỉ phép không lương" },
  { value: "MISSING_ATTENDANCE", label: "Giải trình quên chấm công" },
  { value: "LATE_EARLY", label: "Đi muộn / Về sớm" },
  { value: "BUSINESS_TRIP", label: "Công tác" },
];

export function RequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { type: "LEAVE_PAID", fromDate: "", toDate: "", reason: "" },
  });

  const onSubmit = async (values: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success("Đã gửi đơn, chờ phê duyệt");
      router.refresh();
    } catch {
      toast.error("Không thể gửi đơn");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Loại đơn
        </label>
        <Select {...register("type")}>
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Từ ngày
          </label>
          <Input type="date" {...register("fromDate")} />
          {errors.fromDate && (
            <p className="mt-1 text-xs text-red-500">{errors.fromDate.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Đến ngày
          </label>
          <Input type="date" {...register("toDate")} />
          {errors.toDate && (
            <p className="mt-1 text-xs text-red-500">{errors.toDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Lý do
        </label>
        <Textarea
          rows={3}
          placeholder="Nhập lý do..."
          {...register("reason")}
        />
        {errors.reason && (
          <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi đơn"}
      </button>
    </form>
  );
}