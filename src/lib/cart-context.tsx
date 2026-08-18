import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "./products";
import { useAdmin } from "./admin-context";

type CartItem = { productId: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: { product: Product; qty: number; lineTotal: number }[];
};

const Ctx = createContext<CartCtx | null>(null);

const KEY = "hunza:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const { allProducts } = useAdmin();

  const value = useMemo<CartCtx>(() => {
    const detailed = items
      .map((it) => {
        const product = allProducts.find((p) => p.id === it.productId);
        if (!product) return null;
        const price = product.salePrice ?? product.price;
        return { product, qty: it.qty, lineTotal: price * it.qty };
      })
      .filter(Boolean) as CartCtx["detailed"];
    return {
      items,
      add: (productId, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === productId);
          if (existing)
            return prev.map((i) =>
              i.productId === productId ? { ...i, qty: i.qty + qty } : i,
            );
          return [...prev, { productId, qty }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) =>
          qty <= 0
            ? prev.filter((i) => i.productId !== productId)
            : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        ),
      clear: () => setItems([]),
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: detailed.reduce((s, d) => s + d.lineTotal, 0),
      detailed,
    };
  }, [items, allProducts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used within CartProvider");
  return v;
}
