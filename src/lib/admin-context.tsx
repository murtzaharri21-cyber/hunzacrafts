import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PRODUCTS, type Category, type Product } from "@/lib/products";
import { safeSetItem } from "@/lib/image-utils";
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
const KEY = "hunza:hidden-products";
const CUSTOM_KEY = "hunza:custom-products";
const EDITS_KEY = "hunza:product-edits";
const REMOTE_KEYS = {
  hidden: "admin-hidden-products",
  custom: "admin-custom-products",
  edits: "admin-product-edits",
};

async function loadRemoteAdminState<T>(remoteKey: string): Promise<T | null> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
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
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: remoteKey, value }, { onConflict: "key" });
    if (error) throw error;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHiddenIds(JSON.parse(raw));
      const rawCustom = localStorage.getItem(CUSTOM_KEY);
      if (rawCustom) setCustomProducts(JSON.parse(rawCustom));
      const rawEdits = localStorage.getItem(EDITS_KEY);
      if (rawEdits) setEdits(JSON.parse(rawEdits));
    } catch {}

    void (async () => {
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
    })();

    let cleanup = () => {};

    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        const resolveRole = async () => {
          try {
            if (!isSupabaseConfigured) {
              setIsAdmin(false);
              return;
            }
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
              setIsAdmin(false);
              return;
            }
            const user = data.user;
            const { data: ok, error: rpcError } = await (supabase as any).rpc("has_role", {
              _user_id: user.id,
              _role: "admin",
            });
            setIsAdmin(!rpcError && ok === true);
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
        cleanup = () => sub.data.subscription.unsubscribe();
      })
      .catch(() => {});

    return () => {
      active = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safeSetItem(KEY, JSON.stringify(hiddenIds));
    void saveRemoteAdminState(REMOTE_KEYS.hidden, hiddenIds);
  }, [hiddenIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeSetItem(CUSTOM_KEY, JSON.stringify(customProducts));
    void saveRemoteAdminState(REMOTE_KEYS.custom, customProducts);
  }, [customProducts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    safeSetItem(EDITS_KEY, JSON.stringify(edits));
    void saveRemoteAdminState(REMOTE_KEYS.edits, edits);
  }, [edits, hydrated]);

  const value = useMemo<AdminCtx>(() => {
    const merge = (p: Product): Product => {
      const e = edits[p.id];
      if (!e) return p;
      const m = { ...p, ...e } as Product;
      if (e.salePrice === null || e.salePrice === undefined) delete m.salePrice;
      return m;
    };
    const allProducts = [...customProducts, ...PRODUCTS].map(merge);
    return {
      isAdmin,
      hiddenIds,
      customProducts: customProducts.map(merge),
      allProducts,
      isHidden: (id) => hiddenIds.includes(id),
      isCustom: (id) => customProducts.some((p) => p.id === id),
      isEdited: (id) => !!edits[id],
      hide: (id) => {
        if (hiddenIds.includes(id)) return;
        void recordAudit(id, "removed");
        setHiddenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      },
      show: (id) => {
        if (!hiddenIds.includes(id)) return;
        void recordAudit(id, "restored");
        setHiddenIds((prev) => prev.filter((x) => x !== id));
      },
      toggle: (id) => {
        const wasHidden = hiddenIds.includes(id);
        void recordAudit(id, wasHidden ? "restored" : "removed");
        setHiddenIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
      },
      clear: () => setHiddenIds([]),
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
        setCustomProducts((prev) => [product, ...prev]);
        void recordAudit(id, "added", product.name);
        return product;
      },
      deleteProduct: (id) => {
        const product = customProducts.find((p) => p.id === id);
        if (!product) return;
        void recordAudit(id, "deleted", product.name);
        setCustomProducts((prev) => prev.filter((p) => p.id !== id));
        setEdits((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
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
        void recordAudit(id, "edited", patch.name ?? current.name);
        setEdits((prev) => ({ ...prev, [id]: next }));
      },
      resetProduct: (id) => {
        if (!edits[id]) return;
        setEdits((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
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
