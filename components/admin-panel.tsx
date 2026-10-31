"use client";

import { useEffect, useState } from "react";
import type { PendingEntry } from "@/lib/types";
import { categoryName } from "@/lib/categories";

export function AdminPanel({ authenticated }: { authenticated: boolean }) {
  const [loggedIn, setLoggedIn] = useState(authenticated);
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  async function loadEntries() {
    const response = await fetch("/api/admin/entries");
    if (!response.ok) {
      const data = await response.json() as { error?: string };
      throw new Error(data.error || "Unable to load pending entries.");
    }
    const data = await response.json() as { entries: PendingEntry[] };
    setEntries(data.entries);
  }

  useEffect(() => {
    if (loggedIn) loadEntries().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load pending entries."));
  }, [loggedIn]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setError(data.error || "Login failed."); return; }
    setLoggedIn(true);
    setPassword("");
  }

  async function act(id: string, action: "approve" | "reject", amount?: number) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/entries/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, amount }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Action failed.");
      await loadEntries();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Action failed.");
    } finally {
      setBusyId("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setEntries([]);
  }

  if (!loggedIn) return <form onSubmit={login} className="mx-auto grid max-w-md gap-4 rounded-2xl border-2 border-ink bg-white p-6 shadow-card"><label className="grid gap-2 text-sm font-bold">Admin password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-lg border border-ink/25 px-3 py-3 font-normal" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button className="rounded-full bg-ink px-5 py-3 font-bold text-white">Log in</button></form>;

  return <section>
    <div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted">{entries.length} pending submission{entries.length === 1 ? "" : "s"}</p><button onClick={logout} className="rounded-full border border-ink px-4 py-2 text-sm font-bold">Log out</button></div>
    {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
    {entries.length === 0 && <div className="rounded-2xl border-2 border-ink bg-white p-10 text-center text-muted">No pending entries.</div>}
    <div className="space-y-4">{entries.map((entry) => <article key={entry.id} className="rounded-2xl border-2 border-ink bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">{entry.title}</h2><a href={entry.url} target="_blank" rel="noreferrer" className="break-all text-sm text-blue-700 underline">{entry.url}</a><p className="mt-1 text-sm text-muted">{entry.description}</p></div><span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">{categoryName(entry.category)}</span></div>
      <div className="mt-4 grid gap-1 text-sm sm:grid-cols-2"><p><b>Requested bid:</b> ${entry.amount.toLocaleString()} USD</p><p><b>Payment route:</b> {entry.payment_method === "upi" ? "India · UPI / bank" : "Outside India · PayPal"}</p><p><b>Expected payment:</b> {entry.payment_currency === "INR" ? "₹" : "$"}{entry.payment_amount.toLocaleString()} {entry.payment_currency}{entry.payment_currency === "INR" ? ` (₹${entry.payment_fx_rate}/USD)` : ""}</p><p><b>Email:</b> {entry.email}</p><p className="break-all"><b>Payment reference / payer:</b> {entry.payment_ref || "—"}</p><p><b>Submitted:</b> {new Date(entry.created_at).toLocaleString()}</p></div>
      <div className="mt-4 flex flex-wrap gap-3"><button disabled={busyId === entry.id} onClick={() => { const raw = window.prompt(`Confirm amount in USD (requested $${entry.amount})`, String(entry.amount)); if (raw !== null) void act(entry.id, "approve", Number(raw)); }} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">Approve & confirm amount</button><button disabled={busyId === entry.id} onClick={() => { if (window.confirm("Reject this submission?")) void act(entry.id, "reject"); }} className="rounded-full border border-ink px-5 py-2.5 text-sm font-bold disabled:opacity-50">Reject</button></div>
    </article>)}</div>
  </section>;
}
