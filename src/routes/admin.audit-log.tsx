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
  // The audit log is restricted to the separate admin application. Render an explanatory page.
  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Admin</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Catalog Audit Log</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Audit log access is restricted to the separate admin application and is not available from this site.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          Administrators should use the dedicated admin app to view audit logs. If running locally, the admin app commonly runs at <span className="font-mono">http://localhost:5173</span>.
        </p>
      </section>
    </SiteLayout>
  );
}
