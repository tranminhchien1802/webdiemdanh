"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ShieldAlert } from "lucide-react";

export function SessionGuard() {
  const [kicked, setKicked] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (kicked) return;

    const check = async () => {
      try {
        const res = await fetch("/api/session/status", { cache: "no-store" });
        if (res.status === 401 || res.status === 403) {
          setKicked(true);
          await signOut({ redirect: false });
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (data?.valid === false) {
          setKicked(true);
          await signOut({ redirect: false });
          window.location.href = "/login";
        }
      } catch {
        // giữ im lặng khi mạng lỗi tạm thời
      }
    };

    check();
    pollRef.current = setInterval(check, 5000);
    return () => clearInterval(pollRef.current);
  }, [kicked]);

  if (!kicked) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl dark:bg-zinc-950">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Phiên đăng nhập đã hết hạn
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Tài khoản của bạn vừa đăng nhập ở thiết bị khác. Bạn sẽ được chuyển về trang đăng nhập.
        </p>
        <button
          onClick={() => {
            signOut({ redirect: false });
            window.location.href = "/login";
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <LogOut className="h-4 w-4" />
          Về trang đăng nhập
        </button>
      </div>
    </div>
  );
}