import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { formatPKR, getProduct } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAdmin } from "@/lib/admin-context";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    return { product: product ?? null };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData?.product) {
      return {
        meta: [{ title: "Product — Hunza & Co." }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Hunza & Co.` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.shortDescription },
        { property: "og:type", content: "product" },
        { property: "og:url", content: `/product/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.description,
            sku: p.sku,
            offers: {
              "@type": "Offer",
              price: p.salePrice ?? p.price,
              priceCurrency: "PKR",
              availability:
                p.inventory > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm underline">
          Back to shop
        </Link>
      </div>
    </SiteLayout>
  ),
});

function ProductPage() {
  const { product: staticProduct } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { allProducts } = useAdmin();
  const product = allProducts.find((p) => p.slug === slug) ?? staticProduct ?? null;
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  if (!product) {
    return (
      <SiteLayout>
        <div className="container-x py-32 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <Link to="/shop" className="mt-4 inline-block text-sm underline">
            Back to shop
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const price = product.salePrice ?? product.price;
  const wished = has(product.id);
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <SiteLayout>
      <div className="container-x pt-8 md:pt-12">
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>{" "}
          ·{" "}
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>{" "}
          · <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <section className="container-x mt-6 grid gap-10 pb-16 md:mt-10 md:grid-cols-2 md:gap-14 lg:gap-20">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square overflow-hidden rounded-3xl bg-muted"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({
                x: ((e.clientX - r.left) / r.width) * 100,
                y: ((e.clientY - r.top) / r.height) * 100,
              });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300"
              style={
                zoom
                  ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.8)" }
                  : undefined
              }
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {product.images.map((src: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-xl border ${
                    i === activeImg ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:pt-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {product.category.replace("-", " ")}
          </div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-0.5 text-clay">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">128 reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatPKR(price)}</span>
            {product.salePrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-secondary/50 p-5 text-sm">
            {product.ingredients && (
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Ingredients
                </dt>
                <dd className="mt-1">{product.ingredients}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Origin</dt>
              <dd className="mt-1">{product.origin}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">SKU</dt>
              <dd className="mt-1">{product.sku}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-muted"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => add(product.id, qty)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 md:flex-none"
            >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
            <button
              onClick={() => {
                add(product.id, qty);
                navigate({ to: "/checkout" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Buy Now
            </button>
            <button
              onClick={() => toggle(product.id)}
              aria-label="Wishlist"
              className="grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-muted"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-clay text-clay" : ""}`} />
            </button>
          </div>

          <div className="mt-8 border-t border-border pt-6 text-xs text-muted-foreground">
            Free shipping over PKR 5,000 · 7-day returns · Careful packaging
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-x pb-16">
        <h2 className="font-display text-2xl">Customer Reviews</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "Ayesha K.",
              r: "The best honey I've had. Reminds me of my grandmother's kitchen.",
            },
            { n: "Bilal M.", r: "Fresh apricots, well packed, arrived quickly. Highly recommend." },
            { n: "Sara T.", r: "You can feel the craftsmanship. Beautiful piece." },
          ].map((rv) => (
            <div key={rv.n} className="rounded-2xl border border-border p-6">
              <div className="flex items-center gap-0.5 text-clay">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">"{rv.r}"</p>
              <div className="mt-3 text-xs font-medium">{rv.n}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x pb-24">
          <h2 className="font-display text-2xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
