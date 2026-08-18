import { Link } from "@tanstack/react-router";
import { Eye, EyeOff, Heart, Pencil, RotateCcw, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatPKR, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useAdmin } from "@/lib/admin-context";
import { QuickViewDialog } from "./QuickViewDialog";
import { AddProductDialog } from "./AddProductDialog";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { isAdmin, isHidden, toggle: toggleHidden, isCustom, deleteProduct } = useAdmin();
  const [quickOpen, setQuickOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const wished = has(product.id);
  const hidden = isHidden(product.id);
  const custom = isCustom(product.id);
  const price = product.salePrice ?? product.price;

  return (
    <>
      <div className={`group relative flex flex-col ${hidden ? "opacity-60" : ""}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            aria-label={product.name}
            className="block h-full w-full"
          >
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${hidden ? "grayscale" : ""}`}
            />
          </Link>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {hidden && (
              <span className="rounded-full bg-foreground/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-background">
                Removed
              </span>
            )}
            {product.salePrice && !hidden && (
              <span className="rounded-full bg-clay/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                Sale
              </span>
            )}
            {product.isNew && !hidden && (
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-foreground">
                New
              </span>
            )}
            {product.bestseller && !product.salePrice && !product.isNew && !hidden && (
              <span className="rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                Bestseller
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button
              onClick={() => toggle(product.id)}
              aria-label="Toggle wishlist"
              className="grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
            >
              <Heart className={`h-4 w-4 ${wished ? "fill-clay text-clay" : ""}`} />
            </button>
            {isAdmin && (
              <button
                onClick={() => toggleHidden(product.id)}
                aria-label={hidden ? "Include product" : "Remove product"}
                title={hidden ? "Include product" : "Remove product"}
                className="grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
              >
                {hidden ? <RotateCcw className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setEditOpen(true)}
                aria-label="Edit product"
                title="Edit product"
                className="grid h-9 w-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {isAdmin && custom && (
              <button
                onClick={() => {
                  if (confirm(`Delete "${product.name}" permanently?`)) deleteProduct(product.id);
                }}
                aria-label="Delete product"
                title="Delete product"
                className="grid h-9 w-9 place-items-center rounded-full bg-background/90 text-clay shadow-sm backdrop-blur transition-colors hover:bg-background"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>


          <div className="absolute inset-x-3 bottom-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {isAdmin && hidden ? (
              <button
                onClick={() => toggleHidden(product.id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-sm hover:bg-foreground/90"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Include Product
              </button>
            ) : (
              <>
                <button
                  onClick={() => add(product.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-medium text-background shadow-sm hover:bg-foreground/90"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                </button>
                <button
                  onClick={() => setQuickOpen(true)}
                  aria-label="Quick view"
                  className="grid h-10 w-10 place-items-center rounded-full bg-background text-foreground shadow-sm hover:bg-muted"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {product.category.replace("-", " ")}
            </div>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="mt-0.5 block truncate font-display text-base text-foreground hover:underline underline-offset-4"
            >
              {product.name}
            </Link>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {product.salePrice ? (
              <>
                <div className="text-sm font-medium">{formatPKR(product.salePrice)}</div>
                <div className="text-xs text-muted-foreground line-through">
                  {formatPKR(product.price)}
                </div>
              </>
            ) : (
              <div className="text-sm font-medium">{formatPKR(price)}</div>
            )}
          </div>
        </div>
      </div>

      <QuickViewDialog product={product} open={quickOpen} onOpenChange={setQuickOpen} />
      {isAdmin && (
        <AddProductDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
      )}
    </>
  );
}
