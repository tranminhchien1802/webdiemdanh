# Web Điểm Danh MONICA

Hệ thống quản lý điểm danh trực tuyến: nhân viên điểm danh bằng mã PIN, quản lý chấm công, đơn từ, bảng lương.

## Tính năng

- **Điểm danh bằng mã PIN** 6 số (vào làm / tan làm), tự nhận biết Đúng giờ / Đi muộn / Về sớm
- **Một tài khoản – một phiên đăng nhập**: đăng nhập nơi khác thì chỗ cũ bị đá ra realtime
- **Portal nhân viên**: dashboard, điểm danh, lịch sử chấm công, đơn từ, bảng lương, thông báo
- **Portal admin/HR**: quản lý nhân sự (cấp/đổi mã PIN), ca làm việc, xếp lịch, phê duyệt đơn, chính sách, báo cáo, tạo bảng lương tự động
- Phân quyền 4 cấp: Nhân viên / Trưởng nhóm / HR / Super Admin

## Công nghệ

- **Next.js 16** (Turbopack, `proxy.ts` thay `middleware.ts`)
- **Prisma 7** + SQLite (driver adapter `@prisma/adapter-better-sqlite3`)
- **NextAuth 5** (beta) — JWT session, Credentials
- Tailwind CSS v4, react-hook-form, zod v4, recharts, sonner

## Chạy local

```bash
npm install
cp .env.example .env        # đổi AUTH_SECRET
npx prisma migrate deploy
npm run seed                # dữ liệu mẫu
npm run dev                 # http://localhost:3000
```

Hoặc chỉ cần `npm run dev` — script `postinstall` tự generate Prisma Client, `scripts/start.mjs` tự migrate + seed khi start production.

### Tài khoản demo (mật khẩu `123456`)

| Vai trò | Email | PIN |
|---|---|---|
| Super Admin | admin@monica.vn | 000001 |
| HR Manager | hr@monica.vn | 000002 |
| Trưởng nhóm | leader@monica.vn | 000003 |
| Nhân viên | a@monica.vn | 111111 |
| Nhân viên | c@monica.vn | 222222 |
| Nhân viên | d@monica.vn | 333333 |

## Deploy lên Railway

Railway giữ nguyên SQLite (dùng volume bền) — không cần database riêng.

1. Push repo lên GitHub
2. Vào [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → chọn repo
3. Tạo **Volume** (mục Volumes): mount tại path `/data`
4. Cài biến môi trường (Variables):
   - `DATABASE_URL=file:/data/app.db`
   - `AUTH_SECRET=<chuỗi bí mật, sinh bằng npx auth secret>`
   - `AUTH_TRUST_HOST=true`
5. Deploy. Lần khởi động đầu tự chạy migrate + seed dữ liệu mẫu.

Dockerfile + railway.json đã được cấu hình sẵn (Node 22, volume `/data`, healthcheck `/login`).

## Scripts

- `npm run dev` — dev server
- `npm run build` — `prisma generate` + `next build`
- `npm start` — production (next start, PORT mặc định 3000)
- `node scripts/start.mjs` — migrate + seed + start (dùng trong production)
- `npx tsx prisma/seed.ts` — nạp dữ liệu mẫu