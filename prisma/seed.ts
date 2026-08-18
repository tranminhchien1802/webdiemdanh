import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const departments = await Promise.all(
    ["Nhân sự", "Kỹ thuật", "Kinh doanh", "Kế toán"].map((name) =>
      prisma.department.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const users = [
    {
      name: "Admin Monica",
      email: "admin@monica.vn",
      role: Role.SUPER_ADMIN,
      departmentId: departments[0].id,
      position: "Super Admin",
      pin: "000001",
    },
    {
      name: "HR Manager",
      email: "hr@monica.vn",
      role: Role.HR_MANAGER,
      departmentId: departments[0].id,
      position: "HR Manager",
      pin: "000002",
    },
    {
      name: "Trần Văn B",
      email: "leader@monica.vn",
      role: Role.LEADER,
      departmentId: departments[1].id,
      position: "Trưởng phòng Kỹ thuật",
      pin: "000003",
      baseSalary: 18000000,
    },
    {
      name: "Nguyễn Văn A",
      email: "a@monica.vn",
      role: Role.EMPLOYEE,
      departmentId: departments[1].id,
      position: "Kỹ sư phần mềm",
      pin: "111111",
      phone: "0901112233",
      baseSalary: 15000000,
    },
    {
      name: "Lê Thị C",
      email: "c@monica.vn",
      role: Role.EMPLOYEE,
      departmentId: departments[2].id,
      position: "Nhân viên kinh doanh",
      pin: "222222",
      phone: "0904445566",
      baseSalary: 12000000,
    },
    {
      name: "Phạm Thị D",
      email: "d@monica.vn",
      role: Role.EMPLOYEE,
      departmentId: departments[3].id,
      position: "Kế toán",
      pin: "333333",
      phone: "0907778899",
      baseSalary: 13000000,
    },
  ];

  const created: { [email: string]: { id: string; name: string; baseSalary: number } } = {};
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        role: u.role,
        departmentId: u.departmentId,
        position: u.position,
        baseSalary: u.baseSalary ?? 0,
        pin: u.pin,
        phone: u.phone ?? null,
      },
      create: { ...u, password },
    });
    created[u.email] = user;
    console.log(`${u.email} - PIN: ${user.pin}`);
  }

  const shifts = [
    { name: "Ca hành chính", startTime: "08:00", endTime: "17:30" },
    { name: "Ca sáng", startTime: "08:00", endTime: "12:00" },
    { name: "Ca chiều", startTime: "13:00", endTime: "17:30" },
    { name: "Ca đêm", startTime: "20:00", endTime: "05:00" },
  ];

  for (const s of shifts) {
    const existing = await prisma.shift.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.shift.create({ data: s });
    }
  }

  await prisma.policy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      officeName: "Văn phòng Monica",
      officeLat: 10.8231,
      officeLng: 106.6297,
      radiusMeters: 200,
      workStart: "08:00",
      workEnd: "17:30",
      graceMinutes: 15,
      otRate: 1.5,
    },
  });

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const A = created["a@monica.vn"];
  const C = created["c@monica.vn"];
  const D = created["d@monica.vn"];
  const LEADER = created["leader@monica.vn"];
  const HR = created["hr@monica.vn"];

  // Chỉ tạo dữ liệu mẫu khi DB chưa có dữ liệu (tránh reset khi restart)
  const existingAttendance = await prisma.attendance.count({
    where: { userId: { in: [A.id, C.id, D.id] } },
  });
  if (existingAttendance === 0) {
  await prisma.attendance.deleteMany({
    where: { userId: { in: [A.id, C.id, D.id] } },
  });

  const attendancePlans: Record<string, { days: Set<number>; lateDays: Set<number>; earlyDays: Set<number>; missingDays: Set<number> }> = {
    [A.id]: { days: new Set([3,4,5,6,7,10,11,12,13,14,17]), lateDays: new Set([5,13]), earlyDays: new Set([14]), missingDays: new Set([]) },
    [C.id]: { days: new Set([3,4,5,6,7,10,11,12,13,14,17]), lateDays: new Set([7]), earlyDays: new Set([]), missingDays: new Set([10]) },
    [D.id]: { days: new Set([3,4,5,6,7,10,11,12,13,14,17]), lateDays: new Set([4,12]), earlyDays: new Set([11]), missingDays: new Set([]) },
  };

  for (const [uid, plan] of Object.entries(attendancePlans)) {
    for (const day of plan.days) {
      const date = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0, 0);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      if (plan.missingDays.has(day)) {
        await prisma.attendance.create({
          data: { userId: uid, date, status: "MISSING" },
        });
        continue;
      }
      const checkIn = new Date(date);
      if (plan.lateDays.has(day)) {
        checkIn.setHours(8, 20 + (Math.floor(Math.random() * 20)), 0, 0);
      } else {
        checkIn.setHours(7, 50 + Math.floor(Math.random() * 10), 0, 0);
      }
      const checkOut = new Date(date);
      if (plan.earlyDays.has(day)) {
        checkOut.setHours(16, 40 + Math.floor(Math.random() * 20), 0, 0);
      } else {
        checkOut.setHours(17, 30 + Math.floor(Math.random() * 20), 0, 0);
      }
      const status = plan.lateDays.has(day) ? "LATE" : plan.earlyDays.has(day) ? "EARLY_LEAVE" : "ON_TIME";
      await prisma.attendance.create({
        data: { userId: uid, date, checkIn, checkOut, status: status as never },
      });
    }
  }
  console.log("Đã tạo chấm công mẫu cho A, C, D");

  // ---------- ĐƠN TỪ MẪU ----------
  await prisma.request.deleteMany({
    where: { userId: { in: [A.id, C.id, D.id] } },
  });

  const requests = [
    {
      userId: A.id,
      type: "LEAVE_PAID",
      fromDate: new Date(thisYear, thisMonth - 1, 3),
      toDate: new Date(thisYear, thisMonth - 1, 4),
      reason: "Xin nghỉ phép về quê thăm gia đình",
      status: "APPROVED",
      approverId: HR.id,
      approverNote: "Đồng ý. Chúc bạn về quê vui vẻ.",
    },
    {
      userId: A.id,
      type: "MISSING_ATTENDANCE",
      fromDate: new Date(thisYear, thisMonth - 1, 6),
      toDate: new Date(thisYear, thisMonth - 1, 6),
      reason: "Sáng đi khám bệnh, quên chấm công vào. Nhờ xác nhận giúp.",
      status: "PENDING",
    },
    {
      userId: A.id,
      type: "BUSINESS_TRIP",
      fromDate: new Date(thisYear, thisMonth, 20),
      toDate: new Date(thisYear, thisMonth, 22),
      reason: "Đi hỗ trợ khách hàng tại Cần Thơ 3 ngày",
      status: "PENDING",
    },
    {
      userId: C.id,
      type: "LEAVE_UNPAID",
      fromDate: new Date(thisYear, thisMonth - 1, 10),
      toDate: new Date(thisYear, thisMonth - 1, 11),
      reason: "Xin nghỉ không lương do việc gia đình",
      status: "APPROVED",
      approverId: HR.id,
      approverNote: "Đã duyệt.",
    },
    {
      userId: C.id,
      type: "LATE_EARLY",
      fromDate: new Date(thisYear, thisMonth, 5),
      toDate: new Date(thisYear, thisMonth, 5),
      reason: "Đi muộn vì kẹt xe đường Nguyễn Văn Linh",
      status: "PENDING",
    },
    {
      userId: D.id,
      type: "BUSINESS_TRIP",
      fromDate: new Date(thisYear, thisMonth - 1, 12),
      toDate: new Date(thisYear, thisMonth - 1, 12),
      reason: "Đi nộp hồ sơ thuế tại cơ quan thuế quận",
      status: "REJECTED",
      approverId: HR.id,
      approverNote: "Hồ sơ nộp qua dịch vụ công trực tuyến, không cần trực tiếp.",
    },
    {
      userId: D.id,
      type: "LEAVE_PAID",
      fromDate: new Date(thisYear, thisMonth, 25),
      toDate: new Date(thisYear, thisMonth, 26),
      reason: "Nghỉ phép đi du lịch cùng gia đình",
      status: "PENDING",
    },
  ];

  for (const r of requests) {
    await prisma.request.create({ data: r as never });
  }
  console.log("Đã tạo 7 đơn từ mẫu");

  // ---------- BẢNG LƯƠNG MẪU ----------
  await prisma.payslip.deleteMany({
    where: { userId: { in: [A.id, C.id, D.id] } },
  });

  const payslipSeed = [
    { user: A, base: 15000000, allowance: 1000000, overtimeHours: 12, absentDays: 0 },
    { user: C, base: 12000000, allowance: 800000, overtimeHours: 0, absentDays: 2 },
    { user: D, base: 13000000, allowance: 500000, overtimeHours: 6, absentDays: 0 },
  ];

  const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
  const prevYear = thisMonth === 1 ? thisYear - 1 : thisYear;

  for (const p of payslipSeed) {
    const hourlyRate = p.base / 26 / 8;
    const overtimePay = Math.round(p.overtimeHours * hourlyRate * 1.5);
    const insurance = Math.round(p.base * 0.105);
    const deduction = Math.round((p.base / 26) * p.absentDays);
    const total = p.base + p.allowance + overtimePay - insurance - deduction;

    await prisma.payslip.create({
      data: {
        userId: p.user.id,
        month: prevMonth,
        year: prevYear,
        baseSalary: p.base,
        allowance: p.allowance,
        overtimePay,
        deduction,
        insurance,
        total,
      },
    });
    await prisma.payslip.create({
      data: {
        userId: p.user.id,
        month: thisMonth,
        year: thisYear,
        baseSalary: p.base,
        allowance: p.allowance,
        overtimePay,
        deduction,
        insurance,
        total,
      },
    });
    console.log(`Bảng lương ${p.user.name}: tháng ${prevMonth}/${prevYear} và ${thisMonth}/${thisYear}`);
  }

  // ---------- THÔNG BÁO MẪU ----------
  const notifData = [
    { userId: A.id, title: "Đơn xin nghỉ phép đã được duyệt", message: "Đơn nghỉ phép 03-04 của bạn đã được HR phê duyệt.", type: "APPROVAL" },
    { userId: A.id, title: "Bảng lương tháng mới", message: `Bảng lương tháng ${prevMonth}/${prevYear} đã sẵn sàng, hãy kiểm tra trong mục Bảng lương.`, type: "PAYSLIP" },
    { userId: C.id, title: "Bạn bị chấm công thiếu 1 ngày", message: "Ngày 10 bạn không có bản ghi chấm công. Vui lòng gửi đơn giải trình.", type: "WARNING" },
    { userId: C.id, title: "Đơn nghỉ không lương đã được duyệt", message: "Đơn nghỉ không lương của bạn đã được phê duyệt.", type: "APPROVAL" },
    { userId: D.id, title: "Đơn công tác bị từ chối", message: "Đơn công tác nộp hồ sơ thuế của bạn bị từ chối. Lý do: nộp qua dịch vụ công trực tuyến.", type: "REJECTION" },
  ];

  for (const n of notifData) {
    const existing = await prisma.notification.findFirst({
      where: { userId: n.userId, title: n.title },
    });
    if (!existing) {
      await prisma.notification.create({ data: n });
    }
  }
  console.log("Đã tạo thông báo mẫu");
  }

  console.log("Seed hoàn tất!");
  console.log("Tài khoản: admin@monica.vn / 123456 (Admin, PIN 000001)");
  console.log("Tài khoản: a@monica.vn / 123456 (Nhân viên, PIN 111111)");
  console.log("Tài khoản: c@monica.vn / 123456 (PIN 222222)");
  console.log("Tài khoản: d@monica.vn / 123456 (PIN 333333)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());