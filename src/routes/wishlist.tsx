import { Link, createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/products";
import { useWishlist } from "@/lib/wishlist-context";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlist — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const items = PRODUCTS.filter((p) => ids.includes(p.id));

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl">Wishlist</h1>
      </section>

      <section className="container-x mt-10 pb-24">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <p className="text-muted-foreground">Nothing saved yet.</p>
            <Link
              to="/shop"
              className="mt-6 inline-block rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
