import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/supabase-admin";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  const db = getAdminDb();
  const { data, error } = await db.from("entries").select("url").eq("id", id).eq("status", "approved").maybeSingle();
  if (error) throw new Error(`Could not look up link: ${error.message}`);
  if (!data?.url) return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  const { error: updateError } = await db.rpc("increment_entry_clicks", { p_entry_id: id });
  if (updateError) throw new Error(`Could not record click: ${updateError.message}`);
  return NextResponse.redirect(data.url, { status: 307 });
}
