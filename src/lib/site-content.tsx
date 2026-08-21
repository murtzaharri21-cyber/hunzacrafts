import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { safeSetItem } from "@/lib/image-utils";
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
const KEY = "hunza:site-content";
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

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setContent({ ...DEFAULT_CONTENT, ...JSON.parse(raw) });
    } catch {}

    void (async () => {
      const remote = await loadRemoteSiteContent();
      if (!active || !remote) {
        if (active) setHydrated(true);
        return;
      }
      setContent({ ...DEFAULT_CONTENT, ...remote });
      if (active) setHydrated(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeSetItem(KEY, JSON.stringify(content));
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
