import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/supabase-admin";
import { cleanAmount } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  if (!await hasAdminSession()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid entry ID." }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const values = body as Record<string, unknown>;
  const action = values.action;
  try {
    const db = getAdminDb();
    if (action === "approve") {
      const amount = cleanAmount(values.amount);
      const { error } = await db.rpc("approve_entry", { p_entry_id: id, p_amount: amount });
      if (error) {
        const conflict = error.message.includes("must exceed");
        return NextResponse.json({ error: error.message }, { status: conflict ? 409 : 400 });
      }
    } else if (action === "reject") {
      const { data, error } = await db.from("entries").update({ status: "rejected" }).eq("id", id).eq("status", "pending").select("id");
      if (error) throw new Error(error.message);
      if (!data?.length) return NextResponse.json({ error: "Entry was not pending or no longer exists." }, { status: 409 });
    } else {
      return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin action failed.";
    const status = /Amount must|positive whole USD amount/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
