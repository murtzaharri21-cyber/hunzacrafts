-- Migration: create order_requests table for order audits
-- Apply this in Supabase SQL Editor to allow the app to record order requests for admin review

create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text not null,
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
  created_at timestamptz not null default now()
);

grant select on public.order_requests to authenticated;
grant all on public.order_requests to service_role;

alter table public.order_requests enable row level security;

create policy "Admins can view order requests"
  on public.order_requests for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert order requests"
  on public.order_requests for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') or auth.uid() is null);
