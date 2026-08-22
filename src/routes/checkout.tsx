import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { detailed, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0);
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 350;
  const total = Math.max(0, subtotal + shipping - applied);

  // Controlled form state for capturing order details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [busy, setBusy] = useState(false);

  async function recordOrder() {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getUser();
      const user = data?.user ?? null;

      const orderId = "HZ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const items = detailed.map(({ product, qty, lineTotal }) => ({
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        qty,
        unit_price: product.price,
        line_total: lineTotal,
        images: product.images,
      }));

      const payload = {
        order_id: orderId,
        user_id: user?.id ?? null,
        user_email: user?.email ?? email ?? null,
        contact: { name, email, phone },
        shipping: { address, city, postal, country },
        payment_method: payment,
        items,
        subtotal,
        shipping_cost: shipping,
        discount: applied,
        total,
        status: "pending",
        admin_notes: "",
        created_at: new Date().toISOString(),
      } as any;

      // Attempt to insert into a dedicated order_requests table. If the table doesn't exist,
      // this will fail gracefully and we still proceed with local navigation.
      await (supabase as any).from("order_requests").insert([payload]);

      try {
        localStorage.setItem(
          "hunza:last-order",
          JSON.stringify({
            order_id: orderId,
            user_email: user?.email ?? email ?? null,
            total,
            status: "pending",
            created_at: payload.created_at,
            items,
            contact: payload.contact,
            shipping: payload.shipping,
            payment_method: payment,
          }),
        );
      } catch {
        // Ignore local storage issues; the checkout session should still proceed.
      }
    } catch (err) {
      // Log to console; don't block checkout if the audit insert fails.
      console.warn("Failed to record order audit:", err);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await recordOrder();
      clear();
      navigate({ to: "/order-confirmation" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl">Checkout</h1>
      </section>

      <section className="container-x mt-8 grid gap-10 pb-24 md:mt-12 md:grid-cols-[1fr_400px] md:gap-14">
        <form className="space-y-8" onSubmit={onSubmit}>
          <div>
            <h2 className="font-display text-xl">Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <input
                required
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl">Shipping</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
              />
              <input
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <input
                required
                placeholder="Postal code"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm sm:col-span-2"
              >
                <option>Pakistan</option>
              </select>
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl">Payment</h2>
            <div className="mt-4 space-y-2">
              {["Cash on Delivery", "Bank Transfer", "Card (coming soon)"].map((m) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 has-checked:border-foreground"
                >
                  <input
                    type="radio"
                    name="pay"
                    value={m}
                    checked={payment === m}
                    onChange={() => setPayment(m)}
                    className="accent-foreground"
                  />
                  <span className="text-sm">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full rounded-full bg-foreground py-3.5 text-sm font-medium text-background hover:bg-foreground/90"
          >
            {busy ? "Placing order…" : `Place Order · ${formatPKR(total)}`}
          </button>
        </form>

        <aside className="h-fit space-y-4 rounded-3xl bg-secondary/50 p-6 md:sticky md:top-24">
          <h2 className="font-display text-xl">Order Summary</h2>
          <ul className="divide-y divide-border">
            {detailed.map(({ product, qty, lineTotal }) => (
              <li key={product.id} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">Qty {qty}</div>
                </div>
                <div className="text-sm">{formatPKR(lineTotal)}</div>
              </li>
            ))}
            {detailed.length === 0 && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Your cart is empty.
              </li>
            )}
          </ul>

          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() =>
                setApplied(
                  coupon.trim().toUpperCase() === "HUNZA10" ? Math.round(subtotal * 0.1) : 0,
                )
              }
              className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Apply
            </button>
          </div>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPKR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPKR(shipping)}</dd>
            </div>
            {applied > 0 && (
              <div className="flex justify-between text-accent">
                <dt>Discount</dt>
                <dd>- {formatPKR(applied)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatPKR(total)}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </SiteLayout>
  );
}
