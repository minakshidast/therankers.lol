import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin-panel";
import { hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return <div className="mx-auto max-w-4xl px-5 py-12"><p className="text-xs font-black uppercase tracking-[.2em] text-muted">Private</p><h1 className="mb-7 mt-2 font-display text-4xl uppercase">Admin review</h1><AdminPanel authenticated={await hasAdminSession()} /></div>;
}
