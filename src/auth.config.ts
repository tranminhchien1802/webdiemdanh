import type { NextAuthConfig } from "next-auth";

// Config dùng cho PROXY (middleware) — KHÔNG import prisma để proxy không
// query DB trên mỗi request (serverless Vercel sẽ lỗi).
// Logic sessionVersion (kick 1 tài khoản 1 phiên) nằm trong jwt callback của
// src/auth.ts (chạy ở server code), và SessionGuard client kiểm tra qua API.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");

      if (isAdminPath) {
        if (!isLoggedIn) return false;
        const role = (auth.user as { role?: string })?.role;
        return role === "SUPER_ADMIN" || role === "HR_MANAGER";
      }

      const isPortal = nextUrl.pathname.startsWith("/dashboard");
      if (isPortal) return isLoggedIn;

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
