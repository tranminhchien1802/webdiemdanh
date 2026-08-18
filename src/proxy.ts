import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
    const role = (req.auth?.user as { role?: string })?.role;
    if (role !== "SUPER_ADMIN" && role !== "HR_MANAGER") {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", nextUrl));
    }
  }

  if (
    isLoggedIn &&
    (nextUrl.pathname.startsWith("/login") ||
      nextUrl.pathname.startsWith("/register"))
  ) {
    return Response.redirect(new URL("/dashboard", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};