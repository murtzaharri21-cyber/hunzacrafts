import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function safeNext(next: string | undefined | null): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: Callback,
});

function Callback() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  useEffect(() => {
    const target = safeNext(next);
    let done = false;

    function readAdminEmails(): string[] {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env = (import.meta as any).env ?? {};
        const raw = env.VITE_ADMIN_EMAILS ?? (typeof process !== 'undefined' ? process.env.ADMIN_EMAILS : undefined);
        if (!raw) return [];
        return String(raw).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      } catch {
        return [];
      }
    }

    function isForceShowAdmin(): boolean {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env = (import.meta as any).env ?? {};
        const force = String(env.VITE_FORCE_SHOW_ADMIN ?? '').toLowerCase();
        if (force === 'true' || force === '1') return true;
        if (Boolean(env.DEV)) return true;
        return false;
      } catch {
        return false;
      }
    }

    const finish = async () => {
      try {
        if (done) return;
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) return;
        done = true;

        // Force-show wins
        if (isForceShowAdmin()) {
          navigate({ to: target });
          return;
        }

        // Verify admin access (admin roles are assigned server-side only).
        try {
          const { data: ok, error: rpcError } = await (supabase as any).rpc('has_role', {
            _user_id: data.user.id,
            _role: 'admin',
          });
          if (!rpcError && ok === true) {
            navigate({ to: target });
            return;
          }
        } catch (e) {
          // ignore and fallback to env-based emails
        }

        // Fallback to email list
        const emails = readAdminEmails();
        if (emails.length > 0 && data.user.email && emails.includes(data.user.email.toLowerCase())) {
          navigate({ to: target });
          return;
        }

        await supabase.auth.signOut().catch(() => {});
        navigate({ to: '/auth', search: { next: target } });
      } catch (err) {
        console.warn('Callback finish error:', err);
        navigate({ to: '/auth', search: { next: target } });
      }
    };

    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') void finish();
    });
    void finish();
    return () => sub.data.subscription.unsubscribe();
  }, [next, navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Signing you in…
    </div>
  );
}
