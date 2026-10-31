import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-auth";
import { getPendingEntries } from "@/lib/data";

export async function GET() {
  if (!await hasAdminSession()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ entries: await getPendingEntries() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load entries." }, { status: 500 });
  }
}
