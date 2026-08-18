create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create or replace function public.claim_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return false;
  end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return exists (select 1 from public.user_roles where user_id = uid and role = 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin')
  on conflict do nothing;
  return true;
end;
$$;

revoke all on function public.claim_admin() from public;
grant execute on function public.claim_admin() to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, anon, service_role;

create table public.product_audit_log (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  action text not null,
  user_id uuid not null,
  user_email text,
  created_at timestamptz not null default now()
);

grant select, insert on public.product_audit_log to authenticated;
grant all on public.product_audit_log to service_role;

alter table public.product_audit_log enable row level security;

create policy "Admins can view audit log"
  on public.product_audit_log for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert audit entries"
  on public.product_audit_log for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin') and auth.uid() = user_id);