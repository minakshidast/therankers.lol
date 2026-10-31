import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { adminCookieOptions, createAdminToken, validateAdminPassword } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 32) {
    return NextResponse.json({ error: "Admin login is not configured. Set ADMIN_PASSWORD to a random value of at least 32 characters." }, { status: 503 });
  }
  if (Number(request.headers.get("content-length") || 0) > 2_000) {
    return NextResponse.json({ error: "Request is too large." }, { status: 413 });
  }
  const ip = request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const ipHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${ip}`).digest("hex");
  try {
    const { data: allowed, error } = await getAdminDb().rpc("consume_admin_login_limit", { p_ip_hash: ipHash });
    if (error) throw new Error(`Admin login rate limit check failed: ${error.message}`);
    if (allowed !== true) return NextResponse.json({ error: "Too many login attempts. Try again in 15 minutes." }, { status: 429 });
  } catch (error) {
    console.error("Admin login rate limit failed", error);
    return NextResponse.json({ error: "Admin login is temporarily unavailable." }, { status: 503 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !validateAdminPassword((body as Record<string, unknown>).password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("rank_admin", createAdminToken(), adminCookieOptions());
  return response;
}
