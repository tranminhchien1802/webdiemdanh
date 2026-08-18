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
- **Prisma 7** + **PostgreSQL** (driver adapter `@prisma/adapter-pg`)
- **NextAuth 5** (beta) — JWT session, Credentials
- Tailwind CSS v4, react-hook-form, zod v4, recharts, sonner

## Chạy local

```bash
npm install
cp .env.example .env        # đổi AUTH_SECRET
npm run seed                # dữ liệu mẫu
npm run dev                 # http://localhost:3000
```

Script `postinstall` tự generate Prisma Client. `vercel-build` tự migrate + seed khi deploy.

### Tài khoản demo (mật khẩu `123456`)

| Vai trò | Email | PIN |
|---|---|---|
| Super Admin | admin@monica.vn | 000001 |
| HR Manager | hr@monica.vn | 000002 |
| Trưởng nhóm | leader@monica.vn | 000003 |
| Nhân viên | a@monica.vn | 111111 |
| Nhân viên | c@monica.vn | 222222 |
| Nhân viên | d@monica.vn | 333333 |

## Deploy lên Vercel

App dùng **PostgreSQL** (không phải SQLite) để chạy được trên serverless.

1. Push repo lên GitHub
2. Tạo database Postgres miễn phí (chọn 1 trong 2):
   - **Neon** (neon.tech) → New Project → copy chuỗi `DATABASE_URL`
   - Hoặc **Vercel Postgres**: trong dự án Vercel → tab Storage → Create Database
3. Trên Vercel: **New Project** → Import repo → mở **Settings → Environment Variables**:
   - `DATABASE_URL=<chuỗi postgres://...>`
   - `AUTH_SECRET=<npx auth secret để sinh>`
   - `AUTH_TRUST_HOST=true`
4. Deploy. `vercel-build` tự chạy `prisma migrate deploy` + seed dữ liệu mẫu ở lần đầu.

## Scripts

- `npm run dev` — dev server
- `npm run build` — `prisma generate` + `next build`
- `npm start` — production (next start, PORT mặc định 3000)
- `node scripts/start.mjs` — migrate + seed + start (dùng khi chạy Node thuần)
- `npx tsx prisma/seed.ts` — nạp dữ liệu mẫu