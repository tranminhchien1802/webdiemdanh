import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Web Điểm Danh MONICA
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Hệ thống quản lý điểm danh trực tuyến
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-full border border-zinc-300 px-8 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Đăng ký
          </Link>
        </div>
      </main>
    </div>
  );
}