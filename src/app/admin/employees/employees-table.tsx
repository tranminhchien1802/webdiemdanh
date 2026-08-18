"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Pencil, Trash2, X, KeyRound, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { ROLE_LABELS, ROLE_VARIANTS, formatDate } from "@/lib/constants";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  role: string;
  isActive: boolean;
  baseSalary: number;
  pin: string;
  departmentId?: string | null;
  department?: { name: string } | null;
  createdAt: Date | string;
  _count?: { attendances: number };
};

type Department = { id: string; name: string };

const ROLES = ["EMPLOYEE", "LEADER", "HR_MANAGER", "SUPER_ADMIN"];

export function EmployeesTable({
  employees,
  departments,
  isSuperAdmin,
}: {
  employees: Employee[];
  departments: Department[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [newPin, setNewPin] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    position: "",
    role: "EMPLOYEE",
    departmentId: "",
    baseSalary: "0",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      position: "",
      role: "EMPLOYEE",
      departmentId: "",
      baseSalary: "0",
    });
    setShowForm(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      name: e.name,
      email: e.email,
      password: "",
      phone: e.phone ?? "",
      position: e.position ?? "",
      role: e.role,
      departmentId: e.departmentId ?? "",
      baseSalary: String(e.baseSalary ?? 0),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? "/api/employees" : "/api/employees";
      const method = editing ? "PATCH" : "POST";
      const payload = {
        ...form,
        departmentId: form.departmentId || null,
        phone: form.phone || null,
        position: form.position || null,
        baseSalary: Number(form.baseSalary) || 0,
        ...(form.password ? { password: form.password } : {}),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing.id, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi xảy ra");
        return;
      }
      toast.success(editing ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Không thể lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (e: Employee) => {
    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, isActive: !e.isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Có lỗi");
        return;
      }
      toast.success(e.isActive ? "Đã vô hiệu hóa" : "Đã kích hoạt");
      router.refresh();
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  const resetPin = async (e: Employee) => {
    try {
      const res = await fetch("/api/employees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: e.id, resetPin: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Có lỗi");
        return;
      }
      setNewPin(data.pin);
      toast.success("Đã cấp mã PIN mới");
      router.refresh();
    } catch {
      toast.error("Không thể cấp mã PIN");
    }
  };

  return (
    <div>
      <div className="flex justify-end px-5 py-3">
        <button
          onClick={() => setShowPins(!showPins)}
          className="mr-2 flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <KeyRound className="h-4 w-4" />
          {showPins ? "Ẩn mã PIN" : "Xem mã PIN"}
        </button>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
        >
          <UserPlus className="h-4 w-4" />
          Thêm nhân viên
        </button>
      </div>

      {newPin && (
        <div className="mx-5 mb-4 flex items-center justify-between rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Mã PIN mới:{" "}
              <span className="font-mono text-base font-bold tracking-widest">
                {newPin}
              </span>
            </p>
          </div>
          <button
            onClick={() => setNewPin(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {editing ? `Chỉnh sửa: ${editing.name}` : "Thêm nhân viên mới"}
            </h3>
            <button onClick={() => setShowForm(false)}>
              <X className="h-4 w-4 text-zinc-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Họ và tên
              </label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Email
              </label>
              <Input
                required
                type="email"
                value={form.email}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {editing ? "Mật khẩu (bỏ trống nếu giữ nguyên)" : "Mật khẩu"}
              </label>
              <Input
                type="password"
                placeholder="Mặc định: 123456"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Số điện thoại
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Chức vụ
              </label>
              <Input
                value={form.position}
                placeholder="Ví dụ: Nhân viên kinh doanh"
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Phòng ban
              </label>
              <Select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <option value="">Chưa có</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Vai trò
              </label>
              <Select
                value={form.role}
                disabled={!isSuperAdmin}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Lương cơ bản (VND)
              </label>
              <Input
                type="number"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {submitting ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Thêm nhân viên"}
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 dark:border-zinc-800">
            <th className="px-5 py-3 font-medium">Nhân viên</th>
            <th className="px-5 py-3 font-medium">Phòng ban</th>
            <th className="px-5 py-3 font-medium">Vai trò</th>
            <th className="px-5 py-3 font-medium">Mã PIN</th>
            <th className="px-5 py-3 font-medium">Số công</th>
            <th className="px-5 py-3 font-medium">Trạng thái</th>
            <th className="px-5 py-3 font-medium">Ngày tạo</th>
            <th className="px-5 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr
              key={e.id}
              className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-900"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {e.name}
                    </p>
                    <p className="text-xs text-zinc-500">{e.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-zinc-500">
                {e.department?.name ?? "—"}
              </td>
              <td className="px-5 py-3">
                <Badge variant={ROLE_VARIANTS[e.role]}>
                  {ROLE_LABELS[e.role] ?? e.role}
                </Badge>
              </td>
              <td className="px-5 py-3">
                {showPins ? (
                  <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-widest text-zinc-900 dark:text-zinc-50">
                    {e.pin}
                    <button
                      onClick={() => resetPin(e)}
                      title="Cấp lại mã PIN"
                      className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ) : (
                  <span className="text-zinc-400">••••••</span>
                )}
              </td>
              <td className="px-5 py-3 text-zinc-500">{e._count?.attendances ?? 0}</td>
              <td className="px-5 py-3">
                <Badge variant={e.isActive ? "success" : "danger"}>
                  {e.isActive ? "Hoạt động" : "Bị khóa"}
                </Badge>
              </td>
              <td className="px-5 py-3 text-zinc-500">
                {formatDate(e.createdAt)}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(e)}
                    title="Chỉnh sửa"
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(e)}
                    title={e.isActive ? "Khóa tài khoản" : "Kích hoạt"}
                    className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}