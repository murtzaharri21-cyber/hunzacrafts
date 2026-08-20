-- Ensure order_requests exists with the schema the app expects and configure the right auth policies.

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  user_id uuid,
  user_email text,
  contact jsonb,
  shipping jsonb,
  payment_method text,
  items jsonb,
  subtotal numeric,
  shipping_cost numeric,
  discount numeric,
  total numeric,
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.order_requests
  add column if not exists status text default 'pending';

alter table public.order_requests
  alter column status set default 'pending';

alter table public.order_requests
  alter column status set not null;

alter table public.order_requests
  add column if not exists admin_notes text;

alter table public.order_requests
  drop constraint if exists order_requests_status_check;

alter table public.order_requests
  add constraint order_requests_status_check
  check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

grant select, insert, update on public.order_requests to authenticated;
grant all on public.order_requests to service_role;

alter table public.order_requests enable row level security;

drop policy if exists "Admins can insert order requests" on public.order_requests;
drop policy if exists "Admins can view order requests" on public.order_requests;
drop policy if exists "Admins can update order requests" on public.order_requests;
drop policy if exists "Allow guest inserts into order_requests" on public.order_requests;
drop policy if exists "Allow authenticated owners or admins to insert order_requests" on public.order_requests;

drop policy if exists "Users can view their own order requests" on public.order_requests;
drop policy if exists "Users can insert their own order requests" on public.order_requests;

create policy "Allow guest inserts into order_requests"
on public.order_requests
for insert
to anon
with check (auth.uid() is null);

create policy "Allow authenticated owners or admins to insert order_requests"
on public.order_requests
for insert
to authenticated
with check (
  public.has_role(auth.uid(), 'admin')
  or auth.uid() = user_id
);

create policy "Admins can view order requests"
on public.order_requests
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update order requests"
on public.order_requests
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create index if not exists order_requests_status_idx on public.order_requests (status);
