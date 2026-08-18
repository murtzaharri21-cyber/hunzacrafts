import { Link } from "@tanstack/react-router";
import { Heart, LogOut, Menu, ScrollText, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAdmin } from "@/lib/admin-context";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const { count } = useCart();
  const { ids } = useWishlist();
  const { isAdmin } = useAdmin();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-x flex h-16 items-center gap-4 md:h-20">
        <button
          className="md:hidden -ml-1 p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl md:text-2xl tracking-tight">Hunza & Co.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 ml-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:font-medium"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {isAdmin && (
            <>
              <Link
                to="/admin/audit-log"
                aria-label="Catalog audit log"
                title="Catalog audit log"
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <ScrollText className="h-4.5 w-4.5" />
              </Link>
              <button
                onClick={async () => {
                  const { supabase } = await import("@/integrations/supabase/client");
                  await supabase.auth.signOut();
                  window.location.replace("/");
                }}
                aria-label="Sign out"
                title="Sign out"
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </>
          )}
          <button aria-label="Search" className="rounded-full p-2 hover:bg-muted transition-colors">
            <Search className="h-4.5 w-4.5" />
          </button>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="relative rounded-full p-2 hover:bg-muted transition-colors"
          >
            <Heart className="h-4.5 w-4.5" />
            {ids.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                {ids.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative rounded-full p-2 hover:bg-muted transition-colors"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <nav className="container-x flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-foreground/80"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
      
    </header>
  );
}
