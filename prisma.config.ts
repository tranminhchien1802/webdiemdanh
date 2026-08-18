import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // prisma generate không cần DB thật; chỉ migrate/seed mới cần.
    // Dùng process.env thay vì env() vì env() throw khi thiếu biến.
    url: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/db",
  },
});
