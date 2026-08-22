import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPKR, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export function QuickViewDialog({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { add } = useCart();
  const [index, setIndex] = useState(0);
  const images = product.images;
  const count = images.length;

  useEffect(() => {
    if (open) setIndex(0);
  }, [open, product.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange, count]);

  if (!open) return null;
  const price = product.salePrice ?? product.price;
  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 fade-up"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative grid w-full max-w-3xl gap-0 overflow-hidden rounded-2xl bg-background shadow-xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-background/80 hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="h-full w-full flex-shrink-0 object-cover"
                draggable={false}
              />
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col p-6 md:p-8">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category.replace("-", " ")}
          </div>
          <h3 className="mt-1 font-display text-2xl">{product.name}</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-medium">{formatPKR(price)}</span>
            {product.salePrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPKR(product.price)}
              </span>
            )}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{product.description}</p>
          <div className="mt-4 text-xs text-muted-foreground">Origin · {product.origin}</div>

          {count > 1 && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border transition ${
                    i === index
                      ? "border-foreground"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto flex gap-2 pt-6">
            <button
              onClick={() => {
                add(product.id);
                onOpenChange(false);
              }}
              className="flex-1 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Add to Cart
            </button>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-3 text-sm hover:bg-muted"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
