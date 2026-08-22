import { Link, createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useCart } from "@/lib/cart-context";
import { formatPKR } from "@/lib/products";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Cart — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, setQty, remove, subtotal } = useCart();
  const shipping = subtotal > 5000 || subtotal === 0 ? 0 : 350;
  const total = subtotal + shipping;

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl">Your Cart</h1>
      </section>

      {detailed.length === 0 ? (
        <div className="container-x py-20">
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      ) : (
        <section className="container-x mt-8 grid gap-10 pb-24 md:mt-12 md:grid-cols-[1fr_360px] md:gap-14">
          <div className="divide-y divide-border rounded-3xl border border-border">
            {detailed.map(({ product, qty, lineTotal }) => (
              <div key={product.id} className="flex gap-4 p-4 md:p-6">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        className="block truncate font-display text-base hover:underline"
                      >
                        {product.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {product.category.replace("-", " ")}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(product.id)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="grid h-9 w-9 place-items-center hover:bg-muted"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm">{qty}</span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="grid h-9 w-9 place-items-center hover:bg-muted"
                        aria-label="Increase"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-sm font-medium">{formatPKR(lineTotal)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-3xl bg-secondary/50 p-6 md:sticky md:top-24">
            <h2 className="font-display text-xl">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPKR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatPKR(shipping)}</dd>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPKR(total)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 block w-full rounded-full bg-foreground py-3 text-center text-sm font-medium text-background hover:bg-foreground/90"
            >
              Checkout
            </Link>
            <Link
              to="/shop"
              className="mt-3 block text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Continue shopping
            </Link>
          </aside>
        </section>
      )}
    </SiteLayout>
  );
}
