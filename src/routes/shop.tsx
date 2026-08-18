import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { AddProductDialog } from "@/components/AddProductDialog";
import { CATEGORIES, type Category } from "@/lib/products";
import { useAdmin } from "@/lib/admin-context";

type Search = {
  category?: Category | "all";
  sort?: "newest" | "price-asc" | "price-desc" | "bestselling";
};

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Hunza & Co." },
      {
        name: "description",
        content: "Browse authentic Hunza foods, dry fruits, honey, handicrafts and organic products.",
      },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    category: (search.category as Search["category"]) ?? "all",
    sort: (search.sort as Search["sort"]) ?? "newest",
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category: initialCat, sort: initialSort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { isAdmin, isHidden, allProducts } = useAdmin();
  const [category, setCategory] = useState<Search["category"]>(initialCat ?? "all");
  const [sort, setSort] = useState<Search["sort"]>(initialSort ?? "newest");
  const [addOpen, setAddOpen] = useState(false);

  const products = useMemo(() => {
    let list = [...allProducts];
    if (!isAdmin) list = list.filter((p) => !isHidden(p.id));
    if (category && category !== "all") list = list.filter((p) => p.category === category);
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case "price-desc":
        list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      case "bestselling":
        list.sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));
        break;
      case "newest":
      default:
        list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
        break;
    }
    return list;
  }, [category, sort, isAdmin, isHidden, allProducts]);

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Shop</div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-4xl md:text-5xl">All Products</h1>
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Small-batch and slow-made — every item comes directly from Hunza's farmers and artisans.
        </p>
      </section>

      <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />


      <section className="container-x mt-10 md:mt-14">
        <div className="grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
          {/* Filters */}
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="flex items-center justify-between md:block">
              <h2 className="text-sm font-medium">Categories</h2>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2 md:mt-4 md:block md:space-y-1">
              {[{ value: "all" as const, label: "All" }, ...CATEGORIES].map((c) => {
                const active = category === c.value;
                return (
                  <li key={c.value}>
                    <button
                      onClick={() => {
                        setCategory(c.value);
                        navigate({ search: { category: c.value, sort } });
                      }}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors md:w-full md:rounded-md md:border-0 md:bg-transparent md:px-2 md:py-1.5 md:text-left ${
                        active
                          ? "border-foreground bg-foreground text-background md:bg-secondary md:text-foreground md:font-medium"
                          : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground md:hover:bg-muted"
                      }`}
                    >
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
            {isAdmin && (
              <button
                onClick={() => setAddOpen(true)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
              >
                <Plus className="h-4 w-4" /> Add product
              </button>
            )}
          </aside>

          {/* Grid */}
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                {products.length} product{products.length === 1 ? "" : "s"}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="hidden text-muted-foreground sm:inline">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    const v = e.target.value as Search["sort"];
                    setSort(v);
                    navigate({ search: { category, sort: v } });
                  }}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="bestselling">Best Selling</option>
                </select>
              </label>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
                No products in this category yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="pb-24" />
    </SiteLayout>
  );
}
