"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Fingerprint,
  LogIn,
  LogOut,
  Clock,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TodayData = {
  checkIn?: string;
  checkOut?: string;
  status?: string;
};

type ActionResult = {
  success?: boolean;
  time?: string;
  status?: string;
  error?: string;
};

const STATUS_INFO: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  ON_TIME: { label: "Đúng giờ", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" },
  LATE: { label: "Đi muộn", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  EARLY_LEAVE: { label: "Về sớm", dot: "bg-sky-500", badge: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400" },
};

export default function CheckInPage() {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState<"check-in" | "check-out" | null>(null);
  const [today, setToday] = useState<TodayData | null>(null);
  const [myPin, setMyPin] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [visiblePins, setVisiblePins] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchToday = useCallback(async () => {
    const res = await fetch("/api/attendance/today");
    if (res.ok) {
      setToday((await res.json()) as TodayData | null);
    }
  }, []);

  const fetchMyPin = useCallback(async () => {
    const res = await fetch("/api/me");
    if (res.ok) {
      const data = await res.json();
      setMyPin(data.pin);
    }
  }, []);

  useEffect(() => {
    fetchToday();
    fetchMyPin();
  }, [fetchToday, fetchMyPin]);

  const doAction = async (action: "check-in" | "check-out") => {
    if (pin.length !== 6) {
      toast.error("Vui lòng nhập đủ 6 chữ số mã PIN");
      return;
    }
    setLoading(action);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, pin }),
      });
      const data = (await res.json()) as ActionResult;
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success(
        action === "check-in" ? "Điểm danh vào thành công!" : "Điểm danh ra thành công!"
      );
      setPin("");
      await fetchToday();
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(null);
    }
  };

  const statusInfo = today?.status ? STATUS_INFO[today.status] : null;
  const hasCheckedIn = !!today?.checkIn;
  const hasCheckedOut = !!today?.checkOut;

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-900">
          <Fingerprint className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Web Điểm Danh MONICA
        </h1>
        <p className="text-xs text-zinc-500">Hệ thống quản lý điểm danh trực tuyến</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="font-mono text-4xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
          {now.toLocaleTimeString("vi-VN", { hour12: false })}
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-zinc-500">
          <CalendarDays className="h-4 w-4" />
          {now.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <label className="mb-2 block text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Nhập mã PIN để điểm danh
        </label>
        <div className="relative mx-auto max-w-[260px]">
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="h-16 w-full rounded-2xl border-2 border-zinc-200 bg-zinc-50 text-center font-mono text-3xl tracking-[0.6em] text-zinc-900 outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:focus:border-zinc-50"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => doAction("check-in")}
            disabled={loading !== null || hasCheckedIn}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold text-white transition-all",
              "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
              "dark:bg-emerald-600 dark:hover:bg-emerald-500"
            )}
          >
            {loading === "check-in" ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                {hasCheckedIn ? "Đã điểm danh vào" : "Điểm danh vào"}
              </>
            )}
          </button>
          <button
            onClick={() => doAction("check-out")}
            disabled={loading !== null || !hasCheckedIn || hasCheckedOut}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold text-white transition-all",
              "bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98]",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
              "dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            )}
          >
            {loading === "check-out" ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                {hasCheckedOut ? "Đã điểm danh ra" : "Điểm danh ra"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          <Clock className="h-4 w-4 text-zinc-500" />
          Trạng thái hôm nay
        </h2>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div
              className={cn(
                "rounded-xl border p-3",
                hasCheckedIn
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-1.5">
                {hasCheckedIn ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-400" />
                )}
                <p className="text-xs font-medium text-zinc-500">Giờ vào</p>
              </div>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {today?.checkIn
                  ? new Date(today.checkIn).toLocaleTimeString("vi-VN")
                  : "--:--:--"}
              </p>
            </div>
            <div
              className={cn(
                "rounded-xl border p-3",
                hasCheckedOut
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40"
                  : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
              )}
            >
              <div className="flex items-center gap-1.5">
                {hasCheckedOut ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-zinc-400" />
                )}
                <p className="text-xs font-medium text-zinc-500">Giờ ra</p>
              </div>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                {today?.checkOut
                  ? new Date(today.checkOut).toLocaleTimeString("vi-VN")
                  : "--:--:--"}
              </p>
            </div>
          </div>

          {statusInfo && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-3",
                statusInfo.badge
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", statusInfo.dot)} />
              <span className="text-sm font-semibold">{statusInfo.label}</span>
            </div>
          )}

          {!hasCheckedIn && (
            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500 dark:bg-zinc-900">
              <Clock className="h-4 w-4" />
              Hôm nay bạn chưa điểm danh vào
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <button
          onClick={() => setVisiblePins(!visiblePins)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Mã PIN cá nhân của bạn
              </p>
              <p className="text-xs text-zinc-500">Dùng để điểm danh vào và ra mỗi ngày</p>
            </div>
          </div>
          {visiblePins ? (
            <span className="font-mono text-lg font-bold tracking-[0.3em] text-zinc-900 dark:text-zinc-50">
              {myPin ?? "—"}
            </span>
          ) : (
            <span className="text-xs text-zinc-400">Nhấn để xem</span>
          )}
        </button>
      </div>
    </div>
  );
}