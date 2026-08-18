import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";

// The @supabase/supabase-js auth.oauth namespace is beta and not in the public
// types yet — narrow local typing rather than reaching into node_modules.
type OAuthDetails = {
  redirect_url?: string;
  redirect_to?: string;
  client?: { name?: string; redirect_uri?: string } | null;
  scope?: string;
};
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails | null; error: Error | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: Error | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: { redirect_url?: string; redirect_to?: string } | null; error: Error | null }>;
};
const authOAuth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

type Search = { authorization_id: string };

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) {
      throw new Error("Missing authorization_id");
    }
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const params = new URLSearchParams(location.search);
    const id = params.get("authorization_id")!;
    const { data, error } = await authOAuth().getAuthorizationDetails(id);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <SiteLayout>
      <section className="container-x pt-20 pb-24">
        <h1 className="font-display text-3xl">Authorization failed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {(error as Error)?.message ?? String(error)}
        </p>
      </section>
    </SiteLayout>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "an app";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await authOAuth().approveAuthorization(authorization_id)
      : await authOAuth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <SiteLayout>
      <section className="container-x pt-16 pb-24">
        <div className="max-w-lg rounded-3xl border border-border p-8">
          <h1 className="font-display text-2xl">
            Connect {clientName} to Hunza &amp; Co.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {clientName} will be able to call this shop's MCP tools while you're signed in —
            browse the catalog and (once enabled) manage products as you.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            This does not bypass this app's permissions or backend policies.
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy ? "Working…" : "Approve"}
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              Cancel connection
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
