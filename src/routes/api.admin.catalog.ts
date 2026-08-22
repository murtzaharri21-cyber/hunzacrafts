import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const KEYS = {
  hidden: "admin-hidden-products",
  custom: "admin-custom-products",
  edits: "admin-product-edits",
};

export const Route = createFileRoute("/api/admin/catalog")({
  server: {
    handlers: {
      POST: async (ctx: any) => {
        try {
          const req: Request = ctx?.req ?? ctx?.request ?? (ctx?.event?.request as Request) ?? (globalThis as any).request;
          const body = req ? await req.json().catch(() => ({})) : (ctx?.body ?? ctx?.json ?? {});
          const userId = body.user_id ?? undefined;
          const hidden = body.hidden ?? null;
          const custom = body.custom ?? null;
          const edits = body.edits ?? null;

          if (!userId) {
            return new Response(JSON.stringify({ error: "missing user_id" }), { status: 400, headers: { "Content-Type": "application/json" } });
          }

          // Verify admin via supabaseAdmin
          const { data: roles, error: rolesErr } = await (supabaseAdmin as any)
            .from("user_roles")
            .select("role")
            .eq("user_id", userId);
          if (rolesErr) {
            return new Response(JSON.stringify({ error: String(rolesErr.message ?? rolesErr) }), { status: 500, headers: { "Content-Type": "application/json" } });
          }
          const isAdmin = Array.isArray(roles) && roles.some((r: any) => String(r.role) === "admin");
          if (!isAdmin) {
            return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { "Content-Type": "application/json" } });
          }

          const sb = supabaseAdmin as any;

          // Upsert each key if provided (null means skip)
          if (hidden !== null) {
            const { error: e1 } = await sb.from("site_settings").upsert({ key: KEYS.hidden, value: hidden }, { onConflict: "key" });
            if (e1) throw e1;
          }
          if (custom !== null) {
            const { error: e2 } = await sb.from("site_settings").upsert({ key: KEYS.custom, value: custom }, { onConflict: "key" });
            if (e2) throw e2;
          }
          if (edits !== null) {
            const { error: e3 } = await sb.from("site_settings").upsert({ key: KEYS.edits, value: edits }, { onConflict: "key" });
            if (e3) throw e3;
          }

          return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
        } catch (err) {
          return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});
