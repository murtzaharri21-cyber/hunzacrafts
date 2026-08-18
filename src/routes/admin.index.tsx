import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, LogOut, Package, Plus, ScrollText, Settings, ShieldCheck, Store, Undo2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useState } from "react";
import { AddProductDialog } from "@/components/AddProductDialog";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Portal — Hunza & Co." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin, allProducts, hiddenIds, customProducts } = useAdmin();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Portal</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Store Administration</h1>
          </div>
          {isAdmin && (
            <button
              onClick={async () => {
                const { supabase } = await import("@/integrations/supabase/client");
                await supabase.auth.signOut();
                window.location.replace("/");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Manage your storefront catalog, customize homepage content, and review operational audit logs.
        </p>
      </section>

      <section className="container-x mt-10 pb-24">
        {!isSupabaseConfigured && (
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-900 dark:text-amber-200">
            <h3 className="font-semibold text-base mb-1">⚠️ Missing Supabase Configuration on Vercel</h3>
            <p className="text-xs text-muted-foreground dark:text-amber-300/80 mb-3">
              To enable cloud authentication and audit logs on Vercel, please add the following environment variables in your Vercel Project Settings:
            </p>
            <div className="rounded-xl bg-background/80 p-3 font-mono text-xs text-foreground space-y-1">
              <div>VITE_SUPABASE_URL</div>
              <div>VITE_SUPABASE_PUBLISHABLE_KEY</div>
            </div>
          </div>
        )}

        {!isAdmin ? (
          <div className="rounded-3xl border border-border p-8 md:p-12 text-center max-w-lg mx-auto">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
              <ShieldCheck className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="mt-4 font-display text-2xl">Admin Sign In Required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your authorized administrator account to access product management and store settings.
            </p>
            <Link
              to="/auth"
              search={{ next: "/admin" }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              <LogIn className="h-4 w-4" /> Sign In as Admin
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Products</div>
                <div className="mt-2 font-display text-3xl">{allProducts.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Products</div>
                <div className="mt-2 font-display text-3xl">{customProducts.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hidden Products</div>
                <div className="mt-2 font-display text-3xl text-muted-foreground">{hiddenIds.length}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Admin Status</div>
                <div className="mt-2 font-display text-lg text-emerald-600 dark:text-emerald-400 font-medium">Active</div>
              </div>
            </div>

            {/* Admin Actions */}
            <div>
              <h2 className="font-display text-2xl">Management & Tools</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <button
                  onClick={() => setAddOpen(true)}
                  className="flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/40 hover:shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                    <Plus className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg">Add New Product</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a new handcrafted item with custom pricing, images, and description.
                  </p>
                </button>

                <Link
                  to="/shop"
                  className="flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/40 hover:shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                    <Store className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg">Manage Catalog</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse all products on the storefront to edit details, adjust prices, or hide items.
                  </p>
                </Link>

                <Link
                  to="/admin/audit-log"
                  className="flex flex-col items-start rounded-2xl border border-border bg-card p-6 text-left transition-all hover:border-foreground/40 hover:shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                    <ScrollText className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg">Catalog Audit Log</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review chronological record of all product additions, removals, and price modifications.
                  </p>
                </Link>
              </div>
            </div>

            <AddProductDialog open={addOpen} onOpenChange={setAddOpen} />
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
