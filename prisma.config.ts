import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Ưu tiên DATABASE_URL_UNPOOLED (host không qua pgbouncer) để migrate không
    // bị lỗi advisory lock; fallback DATABASE_URL. process.env để không throw.
    url:
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      "postgresql://placeholder:placeholder@localhost:5432/db",
  },
});
