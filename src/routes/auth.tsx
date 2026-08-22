import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";

type Search = { next?: string };
const DEMO_ADMIN_KEY = "hunza-demo-admin";

function safeNext(next: string | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

function isLocalDemoAdminEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_ADMIN_KEY) === "true";
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin sign in — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: AuthPage,
});

/** Confirms the signed-in user is an admin; signs them out otherwise. */
function readAdminEmails(): string[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env ?? {};
    const raw = env.VITE_ADMIN_EMAILS ?? (typeof process !== 'undefined' ? process.env.ADMIN_EMAILS : undefined);
    if (!raw) return [];
    return String(raw)
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function ensureAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return false;
    const user = data.user;

    // First, try the database RPC if available
    try {
      const { data: ok, error: rpcError } = await (supabase as any).rpc("has_role_text", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!rpcError && ok === true) return true;
    } catch (rpcErr) {
      // ignore and try DB fallback
    }

    // DB fallback: query user_roles directly (useful when RPC is ambiguous)
    try {
      const sb = supabase as any;
      const { data: roles, error: rolesErr } = await sb.from("user_roles").select("role").eq("user_id", user.id);
      if (!rolesErr && Array.isArray(roles) && roles.some((r: any) => String(r.role) === "admin")) return true;
    } catch (e) {
      // ignore and fallback to env
    }

    // Fallback: allow admin by email list provided in env (VITE_ADMIN_EMAILS or ADMIN_EMAILS)
    const emails = readAdminEmails();
    if (emails.length > 0 && user.email && emails.includes(user.email.toLowerCase())) {
      return true;
    }

    // Final fallback: sign out the user and deny access
    await supabase.auth.signOut().catch(() => {});
    return false;
  } catch (err) {
    console.warn('ensureAdmin error:', err);
    return false;
  }
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
    if (!isSupabaseConfigured) {
      if (isLocalDemoAdminEnabled()) {
        window.location.replace(target);
      }
      return;
    }
    let active = true;
    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        if (!active || !data?.user) return;
        if (await ensureAdmin()) window.location.replace(target);
      })
      .catch((err) => {
        console.warn("Auth check error:", err);
      });
    return () => {
      active = false;
    };
  }, [target]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!isSupabaseConfigured) {
        if (email.trim().length > 0 && password.trim().length >= 8) {
          window.localStorage.setItem(DEMO_ADMIN_KEY, "true");
          navigate({ to: target });
          return;
        }
        setError("Enter a valid email and password to continue in demo admin mode.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!(await ensureAdmin())) {
        setError(
          "This account does not have admin access. Ensure your user ID has the 'admin' role in Supabase.",
        );
        return;
      }
      navigate({ to: target });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg.toLowerCase().includes("invalid api key")) {
        setError(
          "Invalid Supabase API Key. Please verify that VITE_SUPABASE_PUBLISHABLE_KEY in your Vercel Project Settings > Environment Variables is your Supabase 'anon' (public) key, then trigger a Redeploy in Vercel.",
        );
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  function onDemoAdmin() {
    window.localStorage.setItem(DEMO_ADMIN_KEY, "true");
    navigate({ to: target });
  }

  async function onGoogle() {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/callback?next=" + encodeURIComponent(target),
        },
      });
      if (error) {
        if (
          error.message.includes("missing OAuth secret") ||
          error.message.includes("Unsupported provider")
        ) {
          setError(
            "Google OAuth is not configured in Supabase. Please configure the Google Provider in Supabase Dashboard or sign in with Email & Password.",
          );
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize Google login.");
    }
  }

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <h1 className="font-display text-4xl md:text-5xl">Admin sign in</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          This area is for store administrators only. Shoppers don&apos;t need an account to browse
          or order.
        </p>
      </section>

      <section className="container-x mt-10 pb-24">
        <div className="max-w-md rounded-3xl border border-border p-6 md:p-8">
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
              <strong className="block font-medium mb-1">⚙️ Local demo admin mode</strong>
              Supabase is not configured, so this local build is running in developer mode.
              <ul className="mt-2 list-disc list-inside space-y-1 font-mono text-[11px]">
                <li>Use the demo admin button below to access the admin dashboard locally.</li>
                <li>For production, add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.</li>
              </ul>
            </div>
          )}

          {!isSupabaseConfigured && (
            <button
              type="button"
              onClick={onDemoAdmin}
              className="w-full rounded-full bg-foreground py-3 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Continue in demo admin mode
            </button>
          )}

          {isSupabaseConfigured && (
            <button
              type="button"
              onClick={onGoogle}
              className="w-full rounded-full border border-border bg-background py-3 text-sm font-medium hover:bg-muted"
            >
              Continue with Google
            </button>
          )}

          {isSupabaseConfigured && (
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              demo sign-in
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

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
