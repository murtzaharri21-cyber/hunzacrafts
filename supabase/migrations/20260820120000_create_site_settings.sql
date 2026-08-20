-- Shared site settings for the public storefront and admin editing tools.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.site_settings enable row level security;

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;

create policy "Public site can read shared settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admins can manage shared settings"
on public.site_settings
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.set_site_settings_updated_at();
