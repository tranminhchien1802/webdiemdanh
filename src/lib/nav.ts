import {
  LayoutDashboard,
  KeyRound,
  History,
  FileText,
  Wallet,
  Users,
  CalendarClock,
  CalendarDays,
  CheckCheck,
  Settings,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
};

export const employeeNav: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, roles: ["EMPLOYEE", "LEADER"] },
  { href: "/dashboard/check-in", label: "Chấm công", icon: KeyRound, roles: ["EMPLOYEE", "LEADER"] },
  { href: "/dashboard/attendance", label: "Lịch sử chấm công", icon: History, roles: ["EMPLOYEE", "LEADER"] },
  { href: "/dashboard/requests", label: "Đơn từ", icon: FileText, roles: ["EMPLOYEE", "LEADER"] },
  { href: "/dashboard/payslips", label: "Bảng lương", icon: Wallet, roles: ["EMPLOYEE", "LEADER"] },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
  { href: "/admin/employees", label: "Nhân sự", icon: Users, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
  { href: "/admin/shifts", label: "Ca làm việc", icon: CalendarClock, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
  { href: "/admin/schedules", label: "Lịch trình", icon: CalendarDays, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
  { href: "/admin/approvals", label: "Phê duyệt đơn", icon: CheckCheck, roles: ["SUPER_ADMIN", "HR_MANAGER", "LEADER"] },
  { href: "/admin/policies", label: "Chính sách", icon: Settings, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
  { href: "/admin/reports", label: "Báo cáo", icon: BarChart3, roles: ["SUPER_ADMIN", "HR_MANAGER"] },
];

export function getNavForRole(role?: string): NavItem[] {
  if (!role) return [];
  const all = [...employeeNav, ...adminNav];
  return all.filter((item) => item.roles.includes(role));
}