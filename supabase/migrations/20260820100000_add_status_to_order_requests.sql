-- Add order status tracking to existing order_requests table

alter table public.order_requests
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

alter table public.order_requests
  add column if not exists admin_notes text;

-- Allow admins to update status and notes
do $$ begin
  create policy "Admins can update order requests"
    on public.order_requests for update to authenticated
    using  (public.has_role(auth.uid(), 'admin'))
    with check (public.has_role(auth.uid(), 'admin'));
exception
  when duplicate_object then null;
end $$;

-- Index for fast status filtering
create index if not exists order_requests_status_idx on public.order_requests (status);
