-- Migration: Add admin role for the provided user UUID
-- Run this migration in your Supabase project (SQL Editor or supabase migrations) to grant admin access.

insert into public.user_roles (user_id, role)
values ('dbf4f091-e7f1-4b22-af9b-74e1cba432fb', 'admin'::public.app_role)
on conflict (user_id, role) do nothing;
