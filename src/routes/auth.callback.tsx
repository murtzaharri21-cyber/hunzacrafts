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

    const finish = async () => {
      if (done) return;
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      done = true;
      // Verify admin access (admin roles are assigned server-side only).
      const { data: ok } = await (supabase as any).rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });
      if (ok !== true) {
        await supabase.auth.signOut();
        navigate({ to: "/auth", search: { next: target } });
        return;
      }
      navigate({ to: target });
    };

    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") void finish();
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
