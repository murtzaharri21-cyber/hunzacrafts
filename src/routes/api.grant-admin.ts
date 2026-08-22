import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/grant-admin")({
  server: {
    handlers: {
      POST: async (ctx: any) => {
        try {
          const req: Request = ctx?.req ?? ctx?.request ?? (ctx?.event?.request as Request) ?? (globalThis as any).request;
          const body = req ? await req.json().catch(() => ({})) : (ctx?.body ?? ctx?.json ?? {});
          const userId = (body && body.user_id) || undefined;
          const email = (body && body.email) || undefined;
          if (!userId || !email) {
            return new Response(JSON.stringify({ error: 'missing user_id or email' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // Read allowed admin emails from env (support both VITE_ADMIN_EMAILS and ADMIN_EMAILS)
          const raw = (process.env.VITE_ADMIN_EMAILS ?? process.env.ADMIN_EMAILS ?? "") as string;
          const allowed = String(raw)
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

          // If allowed list is empty, treat as allow-all (auto-grant) to enable immediate admin access after sign-up.
          // WARNING: This effectively grants admin to any signing-up user. Remove this behavior in production or set VITE_ADMIN_EMAILS to restrict.
          if (allowed.length > 0 && !allowed.includes(String(email).toLowerCase())) {
            return new Response(JSON.stringify({ granted: false, reason: 'email not allowed' }), {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // Check if role already exists
          const { data: existing, error: selErr } = await (supabaseAdmin as any)
            .from('user_roles')
            .select('id')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .limit(1);

          if (selErr) {
            return new Response(JSON.stringify({ error: String(selErr.message ?? selErr) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          if (Array.isArray(existing) && existing.length > 0) {
            return new Response(JSON.stringify({ granted: true, already: true }), {
              headers: { 'Content-Type': 'application/json' },
            });
          }

          // Insert admin role row
          const { data: ins, error: insErr } = await (supabaseAdmin as any)
            .from('user_roles')
            .insert([{ user_id: userId, role: 'admin' }]);

          if (insErr) {
            return new Response(JSON.stringify({ error: String(insErr.message ?? insErr) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ granted: true }), { headers: { 'Content-Type': 'application/json' } });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      },
    },
  },
});
