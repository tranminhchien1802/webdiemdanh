import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: { sessionVersion: { increment: 1 } },
          select: { sessionVersion: true },
        });
        token.sessionVersion = updated.sessionVersion;
        return token;
      }

      if (token.id && token.sessionVersion !== undefined) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { sessionVersion: true },
        });
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          return null;
        }
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