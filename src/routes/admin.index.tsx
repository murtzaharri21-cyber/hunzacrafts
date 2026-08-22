import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LogIn,
  LogOut,
  Package,
  Plus,
  ScrollText,
  Settings,
  ShieldCheck,
  Store,
  Undo2,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";
import { isSupabaseConfigured, supabaseConfig } from "@/integrations/supabase/client";
import { useState } from "react";
import { AddProductDialog } from "@/components/AddProductDialog";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin Portal — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin } = useAdmin();

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Portal</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Store Administration</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Manage the storefront, review catalog changes, and access the admin tools.
        </p>
      </section>

      <section className="container-x mt-10 pb-24">
        {!isAdmin ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-border p-8 text-center md:p-12">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
              <ShieldCheck className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="mt-4 font-display text-2xl">Admin access required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access the storefront admin tools.
            </p>
            <a
              href="/auth"
              className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Sign in as admin
            </a>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Link
              to="/admin"
              className="rounded-3xl border border-border p-6 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5" />
                <h3 className="font-medium">Catalog</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Review products, hide items, and edit catalog details.
              </p>
            </Link>
            <Link
              to="/admin/audit-log"
              className="rounded-3xl border border-border p-6 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <ScrollText className="h-5 w-5" />
                <h3 className="font-medium">Audit log</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Track catalog changes and restore items when needed.
              </p>
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-3xl border border-border p-6 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5" />
                <h3 className="font-medium">Order tracking</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Monitor customer orders and update fulfillment status from a dedicated admin-only
                area.
              </p>
            </Link>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
