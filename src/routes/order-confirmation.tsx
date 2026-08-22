import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Package } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

type SavedOrder = {
  order_id: string;
  user_email?: string | null;
  total?: number;
  status?: string;
  created_at?: string;
  items?: Array<{
    name: string;
    qty?: number;
    unit_price?: number;
    line_total?: number;
    images?: string[];
  }>;
  contact?: { name?: string; email?: string; phone?: string };
  shipping?: { address?: string; city?: string; country?: string };
  payment_method?: string;
};

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [{ title: "Order Confirmed — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: OrderPage,
});

function OrderPage() {
  let savedOrder: SavedOrder | null = null;
  try {
    const raw = localStorage.getItem("hunza:last-order");
    if (raw) savedOrder = JSON.parse(raw) as SavedOrder;
  } catch (e) {
    // Ignore parse errors or inaccessible localStorage; show a fallback order instead

    console.warn("Failed to read last order from localStorage", e);
  }

  const orderId =
    savedOrder?.order_id ?? "HZ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const items = savedOrder?.items ?? [];
  const total = savedOrder?.total ?? 0;
  const status = savedOrder?.status ?? "pending";

  return (
    <SiteLayout>
      <section className="container-x py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-white/60 p-6 md:p-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <h1 className="mt-6 text-center font-display text-3xl md:text-4xl">Thank you</h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Your order <span className="font-medium text-foreground">{orderId}</span> is confirmed.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-4 md:p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Order status
                </p>
                <p className="mt-2 text-lg font-medium capitalize">{status}</p>
              </div>
              <div className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {savedOrder ? "Tracked" : "Pending"}
              </div>
            </div>
          </div>

          {items.length > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Package className="h-4 w-4" />
                Items in your order
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.qty ?? 1}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      PKR {Number(item.line_total ?? item.unit_price ?? 0).toLocaleString("en-PK")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Customer</p>
              <p className="mt-2 font-medium">{savedOrder?.contact?.name ?? "Customer"}</p>
              <p className="text-sm text-muted-foreground">
                {savedOrder?.user_email ?? savedOrder?.contact?.email ?? "Email not provided"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payment</p>
              <p className="mt-2 font-medium">{savedOrder?.payment_method ?? "Cash on Delivery"}</p>
              <p className="text-sm text-muted-foreground">
                Total: PKR {Number(total).toLocaleString("en-PK")}
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-3 flex-wrap">
            <Link
              to="/shop"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Keep shopping
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
