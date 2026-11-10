import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Entry, PendingEntry } from "@/lib/types";
import { getAdminDb } from "@/lib/supabase-admin";

function getPublicDbConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) return { url, key };
  if (process.env.NODE_ENV !== "production" && !url) return null;
  throw new Error("Supabase public configuration is incomplete. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export async function getApprovedEntries(): Promise<Entry[]> {
  const config = getPublicDbConfig();
  if (!config) return [];
  const { data, error } = await createClient(config.url, config.key, {
    auth: { autoRefreshToken: false, persistSession: false }
  }).from("entries")
    .select("id,title,url,description,category,amount,clicks,created_at,approved_at")
    .eq("status", "approved")
    .order("amount", { ascending: false });
  if (error) throw new Error(`Could not load leaderboard: ${error.message}`);
  return (data ?? []) as Entry[];
}

export async function getLatestEntries(): Promise<Entry[]> {
  const config = getPublicDbConfig();
  if (!config) return [];
  const { data, error } = await createClient(config.url, config.key, {
    auth: { autoRefreshToken: false, persistSession: false }
  }).from("entries")
    .select("id,title,url,description,category,amount,clicks,created_at,approved_at")
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(`Could not load latest activity: ${error.message}`);
  return (data ?? []) as Entry[];
}

export async function getPendingEntries(): Promise<PendingEntry[]> {
  const { data, error } = await getAdminDb().from("entries")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Could not load pending entries: ${error.message}`);
  return (data ?? []) as PendingEntry[];
}

export async function getTopAmount(): Promise<number> {
  const config = getPublicDbConfig();
  if (!config) return 0;
  const { data, error } = await createClient(config.url, config.key, {
    auth: { autoRefreshToken: false, persistSession: false }
  }).from("entries")
    .select("amount")
    .eq("status", "approved")
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Could not load current top bid: ${error.message}`);
  return data?.amount ?? 0;
}
