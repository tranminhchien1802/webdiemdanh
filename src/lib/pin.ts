import { randomInt } from "crypto";

export function generatePin(): string {
  return String(randomInt(100000, 999999));
}