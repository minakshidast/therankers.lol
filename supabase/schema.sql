create extension if not exists pgcrypto;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description varchar(160) not null,
  category text not null,
  email text not null,
  amount integer not null check (amount > 0),
  payment_method text not null default 'paypal',
  payment_currency text not null default 'USD',
  payment_amount integer not null default 0,
  payment_fx_rate integer not null default 100,
  payment_ref text,
  screenshot_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  clicks integer not null default 0 check (clicks >= 0),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.entries add column if not exists payment_method text not null default 'paypal';
alter table public.entries add column if not exists payment_currency text not null default 'USD';
alter table public.entries add column if not exists payment_amount integer not null default 0;
alter table public.entries add column if not exists payment_fx_rate integer not null default 100;
update public.entries set payment_amount = amount where payment_amount = 0;
do $$
begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.entries'::regclass and conname = 'entries_payment_method_check') then
    alter table public.entries add constraint entries_payment_method_check check (payment_method in ('upi', 'paypal'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.entries'::regclass and conname = 'entries_payment_currency_check') then
    alter table public.entries add constraint entries_payment_currency_check check (payment_currency in ('INR', 'USD'));
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.entries'::regclass and conname = 'entries_payment_amount_check') then
    alter table public.entries add constraint entries_payment_amount_check check (payment_amount > 0);
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.entries'::regclass and conname = 'entries_payment_fx_rate_check') then
    alter table public.entries add constraint entries_payment_fx_rate_check check (payment_fx_rate > 0);
  end if;
end
$$;

create index if not exists entries_approved_amount_idx
  on public.entries (amount desc) where status = 'approved';
create index if not exists entries_approved_latest_idx
  on public.entries (approved_at desc) where status = 'approved';
create index if not exists entries_pending_created_idx
  on public.entries (created_at) where status = 'pending';

alter table public.entries enable row level security;
drop policy if exists "Public can read approved entries" on public.entries;
create policy "Public can read approved entries"
  on public.entries for select to anon, authenticated
  using (status = 'approved');
revoke all on public.entries from anon, authenticated;
grant select (id, title, url, description, category, amount, status, clicks, created_at, approved_at)
  on public.entries to anon, authenticated;

create table if not exists public.submission_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null default 1
);
alter table public.submission_rate_limits enable row level security;
revoke all on public.submission_rate_limits from anon, authenticated;

create or replace function public.consume_submission_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_count integer;
begin
  insert into public.submission_rate_limits (ip_hash, window_started_at, attempts)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
  set attempts = case
        when public.submission_rate_limits.window_started_at < now() - interval '1 hour' then 1
        else public.submission_rate_limits.attempts + 1
      end,
      window_started_at = case
        when public.submission_rate_limits.window_started_at < now() - interval '1 hour' then now()
        else public.submission_rate_limits.window_started_at
      end
  returning attempts into attempt_count;
  return attempt_count <= 5;
end;
$$;

create table if not exists public.admin_login_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null default 1
);
alter table public.admin_login_rate_limits enable row level security;
revoke all on public.admin_login_rate_limits from anon, authenticated;

create or replace function public.consume_admin_login_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_count integer;
begin
  insert into public.admin_login_rate_limits (ip_hash, window_started_at, attempts)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do update
  set attempts = case
        when public.admin_login_rate_limits.window_started_at < now() - interval '15 minutes' then 1
        else public.admin_login_rate_limits.attempts + 1
      end,
      window_started_at = case
        when public.admin_login_rate_limits.window_started_at < now() - interval '15 minutes' then now()
        else public.admin_login_rate_limits.window_started_at
      end
  returning attempts into attempt_count;
  return attempt_count <= 10;
end;
$$;

create or replace function public.approve_entry(p_entry_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_top integer;
begin
  perform pg_advisory_xact_lock(17492831);
  if p_amount is null or p_amount < 1 then
    raise exception 'Confirmed amount must be a positive whole USD amount';
  end if;
  if not exists (select 1 from public.entries where id = p_entry_id and status = 'pending') then
    raise exception 'Entry is not pending or no longer exists';
  end if;
  select amount into current_top
  from public.entries
  where status = 'approved'
  order by amount desc
  limit 1;
  if p_amount <= coalesce(current_top, 0) then
    raise exception 'Confirmed amount must exceed the current top bid';
  end if;
  update public.entries
  set amount = p_amount, status = 'approved', approved_at = now()
  where id = p_entry_id and status = 'pending';
  if not found then
    raise exception 'Entry is no longer pending';
  end if;
end;
$$;

create or replace function public.increment_entry_clicks(p_entry_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.entries set clicks = clicks + 1
  where id = p_entry_id and status = 'approved';
$$;

revoke all on function public.consume_submission_limit(text) from public, anon, authenticated;
revoke all on function public.consume_admin_login_limit(text) from public, anon, authenticated;
revoke all on function public.approve_entry(uuid, integer) from public, anon, authenticated;
revoke all on function public.increment_entry_clicks(uuid) from public, anon, authenticated;
grant execute on function public.consume_submission_limit(text) to service_role;
grant execute on function public.consume_admin_login_limit(text) to service_role;
grant execute on function public.approve_entry(uuid, integer) to service_role;
grant execute on function public.increment_entry_clicks(uuid) to service_role;
