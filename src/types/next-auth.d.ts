import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      position?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    position?: string;
    sessionVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    position?: string;
    sessionVersion?: number;
  }
}
