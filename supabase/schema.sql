-- Expense Manager — database schema
-- Run this in the Supabase SQL editor to recreate the schema on a fresh project.

create table if not exists public.transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('expense','income','investment')),
  txn_date date not null,
  amount numeric(14,2) not null,        -- signed; investment withdrawals are negative
  description text not null default '',
  category text not null default 'Other',
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "own_select" on public.transactions;
drop policy if exists "own_insert" on public.transactions;
drop policy if exists "own_update" on public.transactions;
drop policy if exists "own_delete" on public.transactions;

create policy "own_select" on public.transactions for select to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.transactions for insert to authenticated with check (auth.uid() = user_id);
create policy "own_update" on public.transactions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.transactions for delete to authenticated using (auth.uid() = user_id);

create index if not exists txn_user_date_idx on public.transactions (user_id, txn_date desc);
create index if not exists txn_user_type_idx on public.transactions (user_id, type);
create index if not exists txn_user_cat_idx  on public.transactions (user_id, category);

create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.transactions;
create trigger trg_set_updated_at before update on public.transactions
  for each row execute function public.set_updated_at();
