import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Category, type Product } from "@/lib/products";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

type AuditAction = "removed" | "restored" | "added" | "deleted" | "edited";

async function recordAudit(productId: string, action: AuditAction, productName?: string) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    const product = PRODUCTS.find((p) => p.id === productId);
    await (supabase as any).from("product_audit_log").insert({
      product_id: productId,
      product_name: productName ?? product?.name ?? productId,
      action,
      user_id: user.id,
      user_email: user.email ?? null,
    });
  } catch (err) {
    console.error("[audit] failed to record catalog change", err);
  }
}

type ProductEdit = Omit<Partial<Product>, "salePrice"> & { salePrice?: number | null };

export type NewProductInput = {
  name: string;
  category: Category;
  price: number;
  salePrice?: number;
  shortDescription: string;
  description: string;
  origin: string;
  inventory: number;
  images: string[];
};

type AdminCtx = {
  isAdmin: boolean;
  hiddenIds: string[];
  isHidden: (id: string) => boolean;
  hide: (id: string) => void;
  show: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  customProducts: Product[];
  allProducts: Product[];
  isCustom: (id: string) => boolean;
  addProduct: (input: NewProductInput) => Product;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, patch: Partial<NewProductInput>) => void;
  isEdited: (id: string) => boolean;
  resetProduct: (id: string) => void;
};

const Ctx = createContext<AdminCtx | null>(null);
const REMOTE_KEYS = {
  hidden: "admin-hidden-products",
  custom: "admin-custom-products",
  edits: "admin-product-edits",
};
const DEMO_ADMIN_KEY = "hunza-demo-admin";

function isLocalDemoAdminEnabled() {
 if (typeof window === "undefined") return false;
 return window.localStorage.getItem(DEMO_ADMIN_KEY) === "true";
}

// Decide whether admin UI should be forced visible. Only enable in local development.
function isForceShowAdmin() {
  try {
    // import.meta.env is available at build time; only honor DEV to avoid forcing admin in production
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env ?? {};
    if (Boolean(env.DEV)) return true; // show admin by default during local development
    return false;
  } catch {
    return false;
  }
}

async function loadRemoteAdminState<T>(remoteKey: string): Promise<T | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const sb = supabase as any;
    const { data, error } = await sb
      .from("site_settings")
      .select("value")
      .eq("key", remoteKey)
      .maybeSingle();
    if (error) throw error;
    return (data?.value as T) ?? null;
  } catch {
    return null;
  }
}

async function saveRemoteAdminState<T>(remoteKey: string, value: T) {
  try {
    // Use server-side trusted endpoint to persist catalog state. Client must send current user id to verify admin.
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id ?? undefined;
      if (!userId) return; // cannot persist without user context
      const payload: any = { user_id: userId };
      payload[remoteKey === REMOTE_KEYS.hidden ? 'hidden' : remoteKey === REMOTE_KEYS.custom ? 'custom' : 'edits'] = value;
      await fetch('/api/admin/catalog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(() => {});
    } catch (e) {
      // fallback to previous client-side upsert if server endpoint fails
      const { supabase } = await import("@/integrations/supabase/client");
      const sb = supabase as any;
      const { error } = await sb
        .from("site_settings")
        .upsert({ key: remoteKey, value }, { onConflict: "key" });
      if (error) throw error;
    }
  } catch {
    // Remote persistence is best-effort so the storefront keeps working without a database sync.
  }
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product"
  );
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [customProducts, setCustomProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, ProductEdit>>({});
  const [isAdmin, setIsAdmin] = useState(() => isForceShowAdmin() || (!isSupabaseConfigured && isLocalDemoAdminEnabled()));
  const [hydrated, setHydrated] = useState(false);
  const [remoteProducts, setRemoteProducts] = useState<Product[]>([]);


  useEffect(() => {
    let active = true;
    let cleanup = () => {};

    const refreshFromSupabase = async () => {
      const [hidden, custom, editsFromRemote] = await Promise.all([
        loadRemoteAdminState<string[]>(REMOTE_KEYS.hidden),
        loadRemoteAdminState<Product[]>(REMOTE_KEYS.custom),
        loadRemoteAdminState<Record<string, ProductEdit>>(REMOTE_KEYS.edits),
      ]);

      if (!active) return;
      if (hidden) setHiddenIds(hidden);
      if (custom) setCustomProducts(custom);
      if (editsFromRemote) setEdits(editsFromRemote);
      setHydrated(true);
    };

    void refreshFromSupabase();

    if (!isSupabaseConfigured) {
      setIsAdmin(isForceShowAdmin() || isLocalDemoAdminEnabled());
      return () => {
        active = false;
      };
    }
 
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        // Fetch remote products table (if present) so storefront reflects DB-driven catalog
        const fetchProducts = async () => {
          try {
            const sb = supabase as any;
            const { data: productsData, error: prodErr } = await sb.from("products").select("*");
            if (!prodErr && Array.isArray(productsData)) {
              // Normalize to Product[] shape; backend may include updated_at
              const mapped = productsData.map((p: any) => ({
                id: p.id,
                slug: p.slug ?? p.id,
                name: p.name ?? p.id,
                price: Number(p.price ?? 0),
                salePrice: p.sale_price ?? p.salePrice ?? undefined,
                category: p.category ?? "food",
                shortDescription: p.short_description ?? p.shortDescription ?? "",
                description: p.description ?? "",
                origin: p.origin ?? "",
                sku: p.sku ?? "",
                inventory: Number(p.inventory ?? 0),
                featured: Boolean(p.featured),
                bestseller: Boolean(p.bestseller),
                isNew: Boolean(p.is_new ?? p.isNew),
                images: Array.isArray(p.images) ? p.images : (p.images ? [String(p.images)] : []),
                updated_at: p.updated_at,
              }));
              if (active) setRemoteProducts(mapped);
            }
          } catch (e) {
            // ignore — fallback to static PRODUCTS
          }
        };
        void fetchProducts();

        // Subscribe to products changes and refresh when they occur
        const sb = supabase as any;
        const prodChannel = sb
          .channel("products-sync")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products" },
            () => {
              void fetchProducts();
            },
          )
          .subscribe();

        const resolveRole = async () => {
          // Honor force-show admin flag unconditionally
          if (isForceShowAdmin()) {
            setIsAdmin(true);
            return;
          }
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
              setIsAdmin(false);
              return;
            }
            const user = data.user;

            // Try RPC first
            try {
              const { data: ok, error: rpcError } = await (supabase as any).rpc("has_role_text", {
                _user_id: user.id,
                _role: "admin",
              });
              if (!rpcError && ok === true) {
                setIsAdmin(true);
                return;
              }
            } catch (e) {
              // ignore and continue to DB fallback
            }

            // DB fallback: query the user_roles table directly (useful when RPC is overloaded or ambiguous)
            try {
              const sb = supabase as any;
              const { data: roles, error: rolesErr } = await sb.from("user_roles").select("role").eq("user_id", user.id);
              if (!rolesErr && Array.isArray(roles) && roles.some((r: any) => String(r.role) === "admin")) {
                setIsAdmin(true);
                return;
              }
            } catch (e) {
              // ignore and fallback to emails
            }

            // Fallback: check env-provided admin emails
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const env = (import.meta as any).env ?? {};
              const raw = env.VITE_ADMIN_EMAILS ?? (typeof process !== 'undefined' ? process.env.ADMIN_EMAILS : undefined);
              const emails = raw
                ? String(raw).split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
                : [];
              if (emails.length > 0 && user.email && emails.includes(user.email.toLowerCase())) {
                setIsAdmin(true);
                return;
              }
            } catch (e) {
              // ignore
            }

            setIsAdmin(false);
          } catch {
            setIsAdmin(false);
          }
        };

        void resolveRole();
        const sub = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
            void resolveRole();
          }
        });

        const sb = supabase as any;
        const channel = sb
          .channel("admin-product-sync")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "site_settings",
              filter: `key=in.(${Object.values(REMOTE_KEYS)
                .map((key) => `'${key}'`)
                .join(",")})`,
            },
            () => {
              void refreshFromSupabase();
            },
          )
          .subscribe();

        // cleanup for product channel too
        const prodChannelRef = prodChannel;

        cleanup = () => {
          sub.data.subscription.unsubscribe();
          try { sb.removeChannel(channel); } catch {}
          try { sb.removeChannel(prodChannelRef); } catch {}
        };
      })
      .catch(() => {});

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void saveRemoteAdminState(REMOTE_KEYS.hidden, hiddenIds);
  }, [hiddenIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void saveRemoteAdminState(REMOTE_KEYS.custom, customProducts);
  }, [customProducts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void saveRemoteAdminState(REMOTE_KEYS.edits, edits);
  }, [edits, hydrated]);

  const persistCatalogState = (
    nextHiddenIds: string[],
    nextCustomProducts: Product[],
    nextEdits: Record<string, ProductEdit>,
  ) => {
    void saveRemoteAdminState(REMOTE_KEYS.hidden, nextHiddenIds);
    void saveRemoteAdminState(REMOTE_KEYS.custom, nextCustomProducts);
    void saveRemoteAdminState(REMOTE_KEYS.edits, nextEdits);
  };

  const value = useMemo<AdminCtx>(() => {
    const merge = (p: Product): Product => {
      const e = edits[p.id];
      if (!e) return p;
      const m = { ...p, ...e } as Product;
      if (e.salePrice === null || e.salePrice === undefined) delete m.salePrice;
      return m;
    };
    const baseProducts = remoteProducts && remoteProducts.length > 0 ? remoteProducts : PRODUCTS;
    // Append cache-busting query param to image URLs using updated_at if present
    const normalized = baseProducts.map((p) => {
      const copy: any = { ...p };
      const updated = (p as any).updated_at ?? (p as any).updatedAt ?? undefined;
      if (updated && Array.isArray(copy.images) && copy.images.length) {
        try {
          const suffix = `v=${encodeURIComponent(String(updated))}`;
          copy.images = copy.images.map((url: string) => (url.includes("?") ? `${url}&${suffix}` : `${url}?${suffix}`));
        } catch {}
      }
      return copy as Product;
    });

    const allProducts = [...customProducts, ...normalized].map(merge);
    return {
      isAdmin,
      hiddenIds,
      customProducts: customProducts.map(merge),
      // Prefer remote products if available, otherwise fall back to built-in PRODUCTS
      allProducts,
      isHidden: (id) => hiddenIds.includes(id),
      isCustom: (id) => customProducts.some((p) => p.id === id),
      isEdited: (id) => !!edits[id],
      hide: (id) => {
        if (hiddenIds.includes(id)) return;
        void recordAudit(id, "removed");
        const next = [...hiddenIds, id];
        setHiddenIds(next);
        persistCatalogState(next, customProducts, edits);
      },
      show: (id) => {
        if (!hiddenIds.includes(id)) return;
        void recordAudit(id, "restored");
        const next = hiddenIds.filter((x) => x !== id);
        setHiddenIds(next);
        persistCatalogState(next, customProducts, edits);
      },
      toggle: (id) => {
        const wasHidden = hiddenIds.includes(id);
        void recordAudit(id, wasHidden ? "restored" : "removed");
        const next = wasHidden ? hiddenIds.filter((x) => x !== id) : [...hiddenIds, id];
        setHiddenIds(next);
        persistCatalogState(next, customProducts, edits);
      },
      clear: () => {
        setHiddenIds([]);
        persistCatalogState([], customProducts, edits);
      },
      addProduct: (input) => {
        const id = `custom-${Date.now().toString(36)}`;
        const base = slugify(input.name);
        const taken = new Set([...PRODUCTS, ...customProducts].map((p) => p.slug));
        let slug = base;
        let n = 2;
        while (taken.has(slug)) slug = `${base}-${n++}`;

        const product: Product = {
          id,
          slug,
          name: input.name,
          price: input.price,
          ...(input.salePrice ? { salePrice: input.salePrice } : {}),
          category: input.category,
          shortDescription: input.shortDescription,
          description: input.description,
          origin: input.origin,
          sku: `HZ-${id.toUpperCase().slice(-6)}`,
          inventory: input.inventory,
          isNew: true,
          images: input.images.length ? input.images : ["/placeholder.svg"],
        };
        const nextCustom = [product, ...customProducts];
        setCustomProducts(nextCustom);
        persistCatalogState(hiddenIds, nextCustom, edits);
        void recordAudit(id, "added", product.name);
        return product;
      },
      deleteProduct: (id) => {
        const product = customProducts.find((p) => p.id === id);
        if (!product) return;
        void recordAudit(id, "deleted", product.name);
        const nextCustom = customProducts.filter((p) => p.id !== id);
        const nextEdits = { ...edits };
        delete nextEdits[id];
        setCustomProducts(nextCustom);
        setEdits(nextEdits);
        persistCatalogState(hiddenIds, nextCustom, nextEdits);
      },
      updateProduct: (id, patch) => {
        const current = allProducts.find((p) => p.id === id);
        if (!current) return;
        const next: ProductEdit = {
          ...(edits[id] ?? {}),
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.category !== undefined ? { category: patch.category } : {}),
          ...(patch.price !== undefined ? { price: patch.price } : {}),
          ...(patch.origin !== undefined ? { origin: patch.origin } : {}),
          ...(patch.inventory !== undefined ? { inventory: patch.inventory } : {}),
          ...(patch.shortDescription !== undefined
            ? { shortDescription: patch.shortDescription }
            : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.images !== undefined && patch.images.length ? { images: patch.images } : {}),
          salePrice: patch.salePrice ?? null,
        };
        const nextEdits = { ...edits, [id]: next };
        void recordAudit(id, "edited", patch.name ?? current.name);
        setEdits(nextEdits);
        persistCatalogState(hiddenIds, customProducts, nextEdits);
      },
      resetProduct: (id) => {
        if (!edits[id]) return;
        const nextEdits = { ...edits };
        delete nextEdits[id];
        setEdits(nextEdits);
        persistCatalogState(hiddenIds, customProducts, nextEdits);
      },
    };
  }, [isAdmin, hiddenIds, customProducts, edits]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin must be used within AdminProvider");
  return v;
}
