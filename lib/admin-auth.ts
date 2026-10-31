import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "rank_admin";

function signature(password: string): string {
  return createHmac("sha256", password).update("pay-to-rank-admin-v1").digest("hex");
}

export async function hasAdminSession(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 32) return false;
  const token = (await cookies()).get(cookieName)?.value ?? "";
  const expected = signature(password);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  return tokenBuffer.length === expectedBuffer.length && timingSafeEqual(tokenBuffer, expectedBuffer);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 12
  };
}

export function createAdminToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 32) throw new Error("ADMIN_PASSWORD must be configured with at least 32 characters.");
  return signature(password);
}

export function validateAdminPassword(input: unknown): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 32 || typeof input !== "string") return false;
  const inputBuffer = Buffer.from(input);
  const passwordBuffer = Buffer.from(password);
  return inputBuffer.length === passwordBuffer.length && timingSafeEqual(inputBuffer, passwordBuffer);
}
