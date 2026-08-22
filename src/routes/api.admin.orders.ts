import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/orders")({
  server: {
    handlers: {
      POST: async (ctx: any) => {
        try {
          const req: Request = ctx?.req ?? ctx?.request ?? (ctx?.event?.request as Request) ?? (globalThis as any).request;
          const body = req ? await req.json().catch(() => ({})) : (ctx?.body ?? ctx?.json ?? {});
          const page = Number(body.page ?? 1);
          const pageSize = Number(body.pageSize ?? 50);
          const search = String(body.search ?? "").trim();

          const start = (page - 1) * pageSize;
          const end = start + pageSize - 1;

          let q: any = (supabaseAdmin as any)
            .from("order_requests")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(start, end);

          if (search) {
            const s = `%${search}%`;
            q = q.or(`order_id.ilike.${s},user_email.ilike.${s}`);
          }

          const { data, count, error } = await q;
          if (error) {
            return new Response(JSON.stringify({ error: String(error?.message ?? error) }), { status: 500, headers: { "Content-Type": "application/json" } });
          }

          return new Response(JSON.stringify({ data: data ?? [], count: count ?? 0 }), { headers: { "Content-Type": "application/json" } });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});
