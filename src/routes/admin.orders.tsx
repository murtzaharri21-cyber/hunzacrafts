import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";

type OrderItem = {
  product_id: string;
  slug?: string;
  name: string;
  qty: number;
  unit_price?: number;
  line_total?: number;
  images?: string[];
};

type OrderRequest = {
  id: string;
  order_id: string;
  user_id?: string | null;
  user_email?: string | null;
  contact?: any;
  shipping?: any;
  payment_method?: string | null;
  items?: OrderItem[];
  subtotal?: number;
  shipping_cost?: number;
  discount?: number;
  total?: number;
  created_at: string;
};

export const Route = createFileRoute("/admin/orders")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Order Requests — Hunza & Co." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { isAdmin } = useAdmin();
  const [orders, setOrders] = useState<OrderRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    import("@/integrations/supabase/client")
      .then(async ({ supabase }) => {
        const { data, error } = await (supabase as any)
          .from("order_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (!active) return;
        if (error) setError(error.message);
        else setOrders((data ?? []) as OrderRequest[]);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  function toggle(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Order Requests</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">Customer orders and full details for admin review.</p>
      </section>

      <section className="container-x mt-10 pb-24 md:mt-14">
        {!isAdmin ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto h-6 w-6" />
            <p className="mt-3 text-muted-foreground">Sign in to view order requests.</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">Couldn't load orders: {error}</div>
        ) : orders === null ? (
          <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No orders recorded yet.</div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <>
                      <tr key={o.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <div className="font-medium">{o.order_id}</div>
                          <div className="text-xs text-muted-foreground">{o.id}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{o.user_email ?? o.user_id ?? "Guest"}</td>
                        <td className="px-4 py-3">{o.total ? `PKR ${o.total}` : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggle(o.id)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                            {expanded[o.id] ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {expanded[o.id] && (
                        <tr className="border-t bg-card">
                          <td colSpan={5} className="px-4 py-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h3 className="font-medium">Contact</h3>
                                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(o.contact ?? {}, null, 2)}</pre>

                                <h3 className="mt-4 font-medium">Shipping</h3>
                                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(o.shipping ?? {}, null, 2)}</pre>

                                <h3 className="mt-4 font-medium">Payment</h3>
                                <div className="mt-2 text-sm text-muted-foreground">{o.payment_method ?? "—"}</div>

                                <h3 className="mt-4 font-medium">Totals</h3>
                                <div className="mt-2 text-sm text-muted-foreground">Subtotal: {o.subtotal ?? "—"}</div>
                                <div className="text-sm text-muted-foreground">Shipping: {o.shipping_cost ?? "—"}</div>
                                <div className="text-sm text-muted-foreground">Discount: {o.discount ?? "—"}</div>
                                <div className="text-sm text-foreground">Total: {o.total ?? "—"}</div>
                              </div>

                              <div>
                                <h3 className="font-medium">Items</h3>
                                <div className="mt-2 space-y-3">
                                  {(o.items ?? []).map((it, i) => (
                                    <div key={i} className="flex gap-3 rounded-md border border-border p-3">
                                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                                        {it.images && it.images.length > 0 ? (
                                          <img src={it.images[0]} alt={it.name} className="h-full w-full object-cover" />
                                        ) : (
                                          <div className="h-full w-full bg-muted" />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">{it.name}</div>
                                        <div className="text-xs text-muted-foreground">Product ID: {it.product_id}</div>
                                        <div className="text-xs text-muted-foreground">Qty: {it.qty}</div>
                                        <div className="text-xs text-muted-foreground">Unit: {it.unit_price ?? "—"} · Line: {it.line_total ?? "—"}</div>
                                        <div className="mt-2 text-xs whitespace-pre-wrap text-muted-foreground">{JSON.stringify(it.images ?? [], null, 2)}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
