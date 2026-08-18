/** Convert an image file into a compressed data URL that is safe to keep in localStorage. */
export async function fileToDataUrl(file: File, maxSize = 900, quality = 0.72): Promise<string> {
  const raw = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  if (typeof document === "undefined") return raw;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = raw;
    });

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL("image/jpeg", quality);
    return out.length < raw.length ? out : raw;
  } catch {
    return raw;
  }
}

/** localStorage.setItem that never throws (quota errors are common with data URLs). */
let warned = false;
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.error(`[storage] could not save "${key}" — storage is full.`, err);
    if (!warned && typeof window !== "undefined") {
      warned = true;
      window.alert(
        "This browser's storage is full, so the newest photos could not be saved. Remove some product photos or use image links (URLs) instead of uploads.",
      );
    }
    return false;
  }
}
