import { execSync } from "node:child_process";

const port = process.env.PORT || "3000";

execSync("npx prisma migrate deploy", { stdio: "inherit" });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
execSync(`npx next start -p ${port}`, { stdio: "inherit" });
