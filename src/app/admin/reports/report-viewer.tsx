"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, FileSpreadsheet, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/constants";

type ReportRow = {
  name: string;
  email: string;
  department: string;
  position: string;
  baseSalary: number;
  present: number;
  onTime: number;
  late: number;
  early: number;
  missing: number;
  totalHours: number;
};

type ReportData = {
  month: number;
  year: number;
  policy: { workStart: string; workEnd: string; otRate: number } | null;
  rows: ReportRow[];
};

function toExcelDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}`;
}

function exportCsv(rows: ReportRow[], month: number, year: number) {
  const header = [
    "STT", "Họ tên", "Email", "Phòng ban", "Chức vụ",
    "Lương cơ bản", "Ngày công", "Đúng giờ", "Đi muộn", "Về sớm", "Thiếu công", "Tổng giờ",
  ].join(",");
  const lines = rows.map((r, i) =>
    [
      i + 1,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.department}"`,
      `"${r.position}"`,
      r.baseSalary,
      r.present,
      r.onTime,
      r.late,
      r.early,
      r.missing,
      r.totalHours,
    ].join(",")
  );
  const csv = "\uFEFF" + [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bao-cao-cham-cong-${month}-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Đã xuất báo cáo CSV");
}

export function ReportViewer({
  users,
  defaultMonth,
  defaultYear,
}: {
  users: { name: string; position: string | null }[];
  defaultMonth: number;
  defaultYear: number;
}) {
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?month=${month}&year=${year}`);
      if (res.ok) {
        setData(await res.json());
      } else {
        toast.error("Không thể tải báo cáo");
      }
    } catch {
      toast.error("Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  const generatePayslips = async () => {
    if (!data) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payslips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success(`Đã tạo ${result.count} bảng lương tháng ${month}/${year}`);
    } catch {
      toast.error("Không thể tạo bảng lương");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totals = data
    ? data.rows.reduce(
        (acc, r) => ({
          present: acc.present + r.present,
          onTime: acc.onTime + r.onTime,
          late: acc.late + r.late,
          missing: acc.missing + r.missing,
          hours: acc.hours + r.totalHours,
        }),
        { present: 0, onTime: 0, late: 0, missing: 0, hours: 0 }
      )
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Tháng
          </label>
          <Select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-32"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Năm
          </label>
          <Input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-32"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Cập nhật
        </button>
        <button
          onClick={() => data && exportCsv(data.rows, month, year)}
          disabled={!data || data.rows.length === 0}
          className="flex h-10 items-center gap-2 rounded-lg border border-zinc-300 px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Xuất CSV
        </button>
        <button
          onClick={generatePayslips}
          disabled={loading || !data || data.rows.length === 0}
          className="flex h-10 items-center gap-2 rounded-lg border border-emerald-300 px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
        >
          <Wallet className="h-4 w-4" />
          Tạo bảng lương
        </button>
      </div>

      {totals && (
        <div className="grid gap-3 sm:grid-cols-5">
          <MiniStat label="Tổng ngày công" value={String(totals.present)} />
          <MiniStat label="Đúng giờ" value={String(totals.onTime)} />
          <MiniStat label="Đi muộn" value={String(totals.late)} />
          <MiniStat label="Thiếu công" value={String(totals.missing)} />
          <MiniStat label="Tổng giờ" value={totals.hours.toFixed(1)} />
        </div>
      )}

      {data && data.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-2.5 font-medium">Họ tên</th>
                <th className="px-4 py-2.5 font-medium">Phòng ban</th>
                <th className="px-4 py-2.5 font-medium">Lương CB</th>
                <th className="px-4 py-2.5 font-medium">Công</th>
                <th className="px-4 py-2.5 font-medium">Đúng giờ</th>
                <th className="px-4 py-2.5 font-medium">Muộn</th>
                <th className="px-4 py-2.5 font-medium">Thiếu</th>
                <th className="px-4 py-2.5 font-medium">Tổng giờ</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr
                  key={r.email}
                  className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
                >
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {r.name}
                    </p>
                    <p className="text-xs text-zinc-500">{r.position}</p>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-500">{r.department}</td>
                  <td className="px-4 py-2.5">{formatCurrency(r.baseSalary)}</td>
                  <td className="px-4 py-2.5 font-semibold">{r.present}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{r.onTime}</td>
                  <td className="px-4 py-2.5 text-amber-600">{r.late}</td>
                  <td className="px-4 py-2.5 text-red-600">{r.missing}</td>
                  <td className="px-4 py-2.5">{r.totalHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.rows.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500">
          Không có dữ liệu nhân sự
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}