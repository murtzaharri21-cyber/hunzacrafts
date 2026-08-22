import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { CATEGORIES, type Category, type Product } from "@/lib/products";
import { useAdmin } from "@/lib/admin-context";
import { fileToDataUrl } from "@/lib/image-utils";

export function AddProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** When provided, the dialog edits this product instead of creating one. */
  product?: Product;
}) {
  const { addProduct, updateProduct, resetProduct, isEdited } = useAdmin();
  const editing = !!product;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("handicrafts");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [origin, setOrigin] = useState("Hunza Valley");
  const [inventory, setInventory] = useState("10");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState("");

  useEffect(() => {
    if (!open) return;
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setSalePrice(product.salePrice ? String(product.salePrice) : "");
      setOrigin(product.origin);
      setInventory(String(product.inventory));
      setShortDescription(product.shortDescription);
      setDescription(product.description);
      setImages(product.images.join("\n"));
    } else {
      setName("");
      setCategory("handicrafts");
      setPrice("");
      setSalePrice("");
      setOrigin("Hunza Valley");
      setInventory("10");
      setShortDescription("");
      setDescription("");
      setImages("");
    }
  }, [open, product]);

  if (!open) return null;

  // NOTE: never split on commas — base64 data URLs contain them ("data:image/jpeg;base64,…").
  const imageList = images
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  function submit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      category,
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : undefined,
      origin: origin.trim() || "Hunza Valley",
      inventory: Number(inventory) || 0,
      shortDescription: shortDescription.trim(),
      description: description.trim() || shortDescription.trim(),
      images: imageList,
    };
    if (product) updateProduct(product.id, payload);
    else addProduct(payload);
    onOpenChange(false);
  }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      const url = await fileToDataUrl(file);
      setImages((prev) => (prev ? `${prev}\n${url}` : url));
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">{editing ? "Edit product" : "Add a product"}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Saved to this browser and shown across the shop.
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Origin
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={field} />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">
              Price (PKR)
              <input
                required
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={field}
              />
            </label>
            <label className="block text-sm">
              Sale price
              <input
                type="number"
                min="0"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className={field}
              />
            </label>
            <label className="block text-sm">
              Stock
              <input
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className={field}
              />
            </label>
          </div>

          <label className="block text-sm">
            Short description
            <input
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={field}
            />
          </label>

          <label className="block text-sm">
            Full description
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={field}
            />
          </label>

          <div className="text-sm">
            Photos
            <textarea
              rows={2}
              placeholder="https://… (one per line)"
              value={images}
              onChange={(e) => setImages(e.target.value)}
              className={field}
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                Upload photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>
              {imageList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImages("")}
                  className="text-xs text-muted-foreground underline"
                >
                  Clear photos
                </button>
              )}
            </div>
            {imageList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imageList.map((src, i) => (
                  <div key={`${src}-${i}`} className="relative">
                    <img
                      src={src}
                      alt=""
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => setImages(imageList.filter((_, idx) => idx !== i).join("\n"))}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editing && isEdited(product!.id) && (
              <button
                type="button"
                onClick={() => {
                  resetProduct(product!.id);
                  onOpenChange(false);
                }}
                className="mr-auto rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Reset to original
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              {editing ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
