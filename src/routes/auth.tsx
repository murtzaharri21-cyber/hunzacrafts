import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";

type Search = { next?: string };

function safeNext(next: string | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in — Hunza & Co." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: AuthPage,
});

/** Confirms the signed-in user is an admin; signs them out otherwise. */
async function ensureAdmin(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return false;
  // Admin roles are assigned directly in the database; never self-claimed.
  const { data: ok } = await (supabase as any).rpc("has_role", {
    _user_id: user.id,
    _role: "admin",
  });
  if (ok !== true) {
    await supabase.auth.signOut();
    return false;
  }
  return true;
}

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const target = safeNext(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      if (await ensureAdmin()) window.location.replace(target);
    });
  }, [target]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!(await ensureAdmin())) {
        setError("This account does not have admin access.");
        return;
      }
      navigate({ to: target });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(target),
      },
    });
    if (error) {
      setError(error.message);
    }
  }

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl">Admin sign in</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          This area is for store administrators only. Shoppers don&apos;t need an account to
          browse or order.
        </p>
      </section>

      <section className="container-x mt-10 pb-24">
        <div className="max-w-md rounded-3xl border border-border p-6 md:p-8">
          <button
            type="button"
            onClick={onGoogle}
            className="w-full rounded-full border border-border bg-background py-3 text-sm font-medium hover:bg-muted"
          >
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit}>
            <label className="block">
              <span className="text-sm">Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm">Password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
              />
            </label>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60"
            >
              {busy ? "Please wait…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
