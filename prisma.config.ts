import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // prisma generate không cần DB thật; chỉ migrate/seed mới cần
    url: env("DATABASE_URL") || "postgresql://placeholder:placeholder@localhost:5432/db",
  },
});
