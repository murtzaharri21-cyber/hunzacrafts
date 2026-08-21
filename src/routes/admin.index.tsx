import { createFileRoute, Link } from "@tanstack/react-router";
import { LogIn, LogOut, Package, Plus, ScrollText, Settings, ShieldCheck, Store, Undo2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";
import { isSupabaseConfigured, supabaseConfig } from "@/integrations/supabase/client";
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
  // The admin dashboard is intentionally separated from the main storefront.
  // Render a small explanatory page that points administrators to the dedicated admin app.
  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Portal</div>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">Store Administration (Separated)</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">
          The administration dashboard is hosted separately from this storefront. This site does not expose an admin sign-in form.
        </p>
      </section>

      <section className="container-x mt-10 pb-24">
        <div className="rounded-3xl border border-border p-8 md:p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="mt-4 font-display text-2xl">Admin Access Restricted</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Administrators should use the dedicated admin application to sign in and manage the store.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            If you're running locally, the admin app commonly runs at <span className="font-mono">http://localhost:5173</span>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
