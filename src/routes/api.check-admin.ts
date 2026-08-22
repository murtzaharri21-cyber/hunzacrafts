import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/check-admin")({
  server: {
    handlers: {
      POST: async (ctx: any) => {
        try {
          const req: Request = ctx?.req ?? ctx?.request ?? (ctx?.event?.request as Request) ?? (globalThis as any).request;
          const body = req ? await req.json().catch(() => ({})) : (ctx?.body ?? ctx?.json ?? {});
          const userId = (body && body.user_id) || undefined;
          if (!userId) {
            return new Response(JSON.stringify({ error: 'missing user_id' }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const { data, error } = await (supabaseAdmin as any)
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);

          if (error) {
            return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            });
          }

          const isAdmin = Array.isArray(data) && data.some((r: any) => String(r.role) === 'admin');
          return new Response(JSON.stringify({ isAdmin }), { headers: { 'Content-Type': 'application/json' } });
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
