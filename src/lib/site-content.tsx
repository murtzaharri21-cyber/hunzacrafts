import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import defaultHero from "@/assets/hero-hunza.jpg";

export type SiteContent = {
  heroImage: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  contactAddress1: string;
  contactAddress2: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  heroImage: defaultHero,
  heroEyebrow: "From the Karakoram, with care",
  heroTitle: "Authentic Products from the Heart of Hunza",
  heroSubtitle:
    "We work directly with farmers and artisans in Hunza Valley to bring you honey, dry fruits, oils and handicrafts — grown, harvested and made the traditional way.",
  heroPrimaryCta: "Shop Now",
  heroSecondaryCta: "Our Story",
  contactAddress1: "Karimabad, Hunza Valley",
  contactAddress2: "Gilgit-Baltistan, Pakistan",
  contactEmail: "hello@hunzaandco.example",
  contactPhone: "+92 300 000 0000",
  contactWhatsApp: "923000000000",
};

type Ctx = {
  content: SiteContent;
  update: (patch: Partial<SiteContent>) => void;
  reset: () => void;
};

const SiteContentCtx = createContext<Ctx | null>(null);
const REMOTE_KEY = "site-content";

async function loadRemoteSiteContent(): Promise<Partial<SiteContent> | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", REMOTE_KEY)
      .maybeSingle();
    if (error) throw error;
    return (data?.value as Partial<SiteContent>) ?? null;
  } catch {
    return null;
  }
}

async function saveRemoteSiteContent(next: SiteContent) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: REMOTE_KEY, value: next }, { onConflict: "key" });
    if (error) throw error;
  } catch {
    // Ignore remote-sync errors so the storefront still works without a database connection.
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    let channel: any;
    let removeChannel = () => {};

    const refreshFromSupabase = async () => {
      const remote = await loadRemoteSiteContent();
      if (!active) return;
      if (remote) setContent({ ...DEFAULT_CONTENT, ...remote });
      setHydrated(true);
    };

    void refreshFromSupabase();

    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        channel = supabase
          .channel("site-content-sync")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "site_settings",
              filter: `key=eq.${REMOTE_KEY}`,
            },
            () => {
              void refreshFromSupabase();
            },
          )
          .subscribe();

        removeChannel = () => {
          supabase.removeChannel(channel);
        };
      })
      .catch(() => {});

    return () => {
      active = false;
      removeChannel();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveRemoteSiteContent(content);
  }, [content, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      content,
      update: (patch) => setContent((prev) => ({ ...prev, ...patch })),
      reset: () => setContent(DEFAULT_CONTENT),
    }),
    [content],
  );

  return <SiteContentCtx.Provider value={value}>{children}</SiteContentCtx.Provider>;
}

export function useSiteContent() {
  const v = useContext(SiteContentCtx);
  if (!v) throw new Error("useSiteContent must be used within SiteContentProvider");
  return v;
}
