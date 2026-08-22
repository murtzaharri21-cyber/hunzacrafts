import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EyeOff, RotateCcw, ScrollText } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";

type AuditEntry = {
  id: string;
  product_id: string;
  product_name: string;
  action: "removed" | "restored";
  user_email: string | null;
  user_id: string;
  created_at: string;
};

export const Route = createFileRoute("/admin/audit-log")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Catalog Audit Log — Hunza & Co." },
      {
        name: "description",
        content: "History of products removed from and restored to the Hunza & Co. catalog.",
      },
      { property: "og:title", content: "Catalog Audit Log — Hunza & Co." },
      {
        property: "og:description",
        content: "Track which admin removed or restored a product and when.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditLogPage,
});

function AuditLogPage() {
  const { isAdmin } = useAdmin();
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    import("@/integrations/supabase/client").then(async ({ supabase }) => {
      const { data, error } = await (supabase as any)
        .from("product_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!active) return;
      if (error) setError(error.message);
      else setEntries((data ?? []) as AuditEntry[]);
    });
    return () => {
      active = false;
    };
  }, [isAdmin]);

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Catalog Audit Log</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every time a product is removed from or restored to the storefront, it's recorded here
          with who did it and when.
        </p>
      </section>

      <section className="container-x mt-10 pb-24 md:mt-14">
        {!isAdmin ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <ScrollText className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Sign in to view the catalog audit log.</p>
            <Link
              to="/auth"
              className="mt-5 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Sign in
            </Link>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">
            Couldn't load the audit log: {error}
          </div>
        ) : entries === null ? (
          <div className="rounded-2xl border border-border p-10 text-center text-muted-foreground">
            Loading…
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No catalog changes recorded yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Admin</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                          e.action === "removed"
                            ? "bg-clay/15 text-clay"
                            : "bg-accent/20 text-accent-foreground"
                        }`}
                      >
                        {e.action === "removed" ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        {e.action === "removed" ? "Removed" : "Restored"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.product_name}</div>
                      <div className="text-xs text-muted-foreground">{e.product_id}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.user_email ?? e.user_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
