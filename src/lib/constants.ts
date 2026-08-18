import type { Badge } from "@/components/ui/badge";

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_MANAGER: "HR Manager",
  LEADER: "Trưởng phòng",
  EMPLOYEE: "Nhân viên",
};

export const ROLE_VARIANTS: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  SUPER_ADMIN: "danger",
  HR_MANAGER: "info",
  LEADER: "warning",
  EMPLOYEE: "default",
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  LEAVE_PAID: "Nghỉ phép có lương",
  LEAVE_UNPAID: "Nghỉ phép không lương",
  MISSING_ATTENDANCE: "Giải trình quên chấm công",
  LATE_EARLY: "Đi muộn / Về sớm",
  BUSINESS_TRIP: "Công tác",
};

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Đang chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export const REQUEST_STATUS_VARIANTS: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  ON_TIME: "Đúng giờ",
  LATE: "Đi muộn",
  EARLY_LEAVE: "Về sớm",
  MISSING: "Thiếu công",
};

export const ATTENDANCE_STATUS_VARIANTS: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
  ON_TIME: "success",
  LATE: "warning",
  EARLY_LEAVE: "warning",
  MISSING: "danger",
};

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

export function todayKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}