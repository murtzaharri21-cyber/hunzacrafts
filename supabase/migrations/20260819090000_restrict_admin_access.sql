create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    join public.user_roles r on r.user_id = u.id
    where u.id = _user_id
      and r.role = _role
      and (
        _role <> 'admin'
        or lower(u.email) in ('murtzaharri21@gmail.com', 'murtzharry21@gmail.com')
      )
  )
$$;

insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) in ('murtzaharri21@gmail.com', 'murtzharry21@gmail.com')
on conflict (user_id, role) do nothing;