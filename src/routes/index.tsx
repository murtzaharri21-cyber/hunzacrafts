import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Leaf, Mountain, Pencil, ShieldCheck, Truck } from "lucide-react";
import heroImg from "@/assets/hero-hunza.jpg";
import { EditHeroDialog } from "@/components/EditHeroDialog";
import { useSiteContent } from "@/lib/site-content";
import aboutImg from "@/assets/about-hunza.jpg";
import brandBanner from "@/assets/hunza-hunar-banner.jpeg.asset.json";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { useAdmin } from "@/lib/admin-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hunza & Co. — Authentic Products from the Heart of Hunza" },
      {
        name: "description",
        content:
          "Discover sun-dried apricots, wild honey, handwoven shawls and organic products sourced directly from the farmers and artisans of Hunza Valley.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const { isAdmin, isHidden, allProducts } = useAdmin();
  const { content } = useSiteContent();
  const [heroOpen, setHeroOpen] = useState(false);
  const visible = isAdmin ? allProducts : allProducts.filter((p) => !isHidden(p.id));
  const featured = visible.filter((p) => p.featured).slice(0, 8);
  const bestsellers = visible.filter((p) => p.bestseller).slice(0, 8);
  const newArrivals = visible.filter((p) => p.isNew).slice(0, 8);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={content.heroImage}
            alt="Hunza valley at dawn"
            className="h-full w-full object-cover"
            width={1920}
            height={1200}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-background" />
        </div>
        <div className="container-x flex min-h-[86vh] flex-col justify-end pb-16 pt-32 md:min-h-[92vh] md:pb-24">
          <div className="max-w-2xl fade-up text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Mountain className="h-3.5 w-3.5" /> {content.heroEyebrow}
            </div>
            <h1 className="font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
              {content.heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base text-white/85 md:text-lg">
              {content.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-transform hover:-translate-y-0.5"
              >
                {content.heroPrimaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                {content.heroSecondaryCta}
              </Link>
              {isAdmin && (
                <button
                  onClick={() => setHeroOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-3 text-sm font-medium text-white backdrop-blur hover:bg-white/20"
                >
                  <Pencil className="h-4 w-4" /> Edit hero
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <EditHeroDialog open={heroOpen} onOpenChange={setHeroOpen} />

      {/* Brand banner */}
      <section className="container-x pt-10 md:pt-14">
        <Link to="/shop" className="block overflow-hidden rounded-3xl shadow-sm">
          <img
            src={aboutImg}
            alt="Hunza Hunar — Local handicrafts, culture and heritage from Gilgit Baltistan"
            className="h-auto w-full"
            loading="lazy"
          />
        </Link>
      </section>

      {/* Categories */}
      <section className="container-x py-20 md:py-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Explore</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Featured Categories</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {CATEGORIES.slice(0, 4).map((c) => {
            const categoryImage = allProducts.find((p) => p.category === c.value)?.images[0] ?? heroImg;
            return (
              <Link
                key={c.value}
                to="/shop"
                search={{ category: c.value }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted"
              >
                <img
                  src={categoryImage}
                  alt={c.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between text-white">
                  <span className="font-display text-lg md:text-xl">{c.label}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="container-x pb-20 md:pb-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Loved by many</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Best Selling Products</h2>
          </div>
          <Link
            to="/shop"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-x pb-20 md:pb-28">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Fresh in</div>
              <h2 className="mt-2 font-display text-3xl md:text-4xl">New Arrivals</h2>
            </div>
            <Link
              to="/shop"
              className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex items-center gap-1"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Why choose us */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Why Choose Us</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Slow-made, sourced with intention</h2>
            <p className="mt-4 text-muted-foreground">
              Every product is traceable to the family or workshop that made it — never mass-produced, never anonymous.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { icon: Leaf, title: "100% Organic", body: "Grown without chemicals in the pure Hunza valleys." },
              { icon: Mountain, title: "Direct from Hunza", body: "Sourced straight from farmers and artisans — no middlemen." },
              { icon: ShieldCheck, title: "Quality Guaranteed", body: "Small-batch, hand-checked, honestly priced." },
              { icon: Truck, title: "Nationwide Delivery", body: "Careful packing and reliable shipping across Pakistan." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-background p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-x py-20 md:py-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Handpicked</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Featured</h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* About Hunza */}
      <section className="container-x pb-20 md:pb-28">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted md:aspect-[4/5]">
            <img
              src={aboutImg}
              alt="Hunza artisan at work"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">About Hunza</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">A valley where tradition and taste meet</h2>
            <p className="mt-5 text-muted-foreground">
              Hidden between the peaks of the Karakoram, Hunza is a place where orchards have grown for generations and craft is passed down by hand. Our work is to bring that quiet, careful way of making to your home — while ensuring fair value returns to the families we source from.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background hover:bg-foreground/90"
              >
                Read our story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Kind Words</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">What our customers say</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { q: "The honey is unlike anything I've tasted — floral, deep, and clearly real.", n: "Ayesha, Karachi" },
              { q: "You can taste the sunshine in the apricots. My kids finish a pack in a day.", n: "Bilal, Lahore" },
              { q: "The wool shawl feels heirloom. Beautifully packed, beautifully made.", n: "Sara, Islamabad" },
            ].map((t) => (
              <figure key={t.n} className="rounded-2xl bg-background p-8 shadow-sm">
                <blockquote className="font-display text-lg leading-snug">“{t.q}”</blockquote>
                <figcaption className="mt-6 text-sm text-muted-foreground">— {t.n}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-x py-20 md:py-28">
        <div className="mx-auto max-w-3xl rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl">Join the harvest list</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80">
              Occasional letters with new harvests, artisan stories and small-batch releases. No spam — ever.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="flex-1 rounded-full bg-background/10 px-5 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/60 outline-none ring-1 ring-inset ring-white/20 focus:ring-white/60"
              />
              <button className="rounded-full bg-background px-5 py-3 text-sm font-medium text-foreground hover:bg-background/90">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Instagram gallery */}
      <section className="container-x pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">@hunzaandco</div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">From our journal</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-6">
          {PRODUCTS.slice(0, 6).map((p) => (
            <a
              key={p.id}
              href="#"
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            >
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </a>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
