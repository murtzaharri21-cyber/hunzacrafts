import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";
import { fileToDataUrl } from "@/lib/image-utils";

export function EditHeroDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { content, update, reset } = useSiteContent();
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (open) setDraft(content);
  }, [open, content]);

  if (!open) return null;

  const field =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

  function submit(e: FormEvent) {
    e.preventDefault();
    update(draft);
    onOpenChange(false);
  }

  async function onFile(file?: File | null) {
    if (!file) return;
    const url = await fileToDataUrl(file, 1600, 0.8);
    setDraft((d) => ({ ...d, heroImage: url }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">Edit homepage hero</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Change the background photo and headline text.
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
          <div className="text-sm">
            Background image
            <input
              value={draft.heroImage.startsWith("data:") ? "" : draft.heroImage}
              placeholder={draft.heroImage.startsWith("data:") ? "Uploaded photo" : "https://…"}
              onChange={(e) => setDraft({ ...draft, heroImage: e.target.value })}
              className={field}
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onFile(e.target.files?.[0])}
                />
              </label>
              {draft.heroImage && (
                <img
                  src={draft.heroImage}
                  alt=""
                  className="h-12 w-20 rounded-md border border-border object-cover"
                />
              )}
            </div>
          </div>

          <label className="block text-sm">
            Eyebrow
            <input
              value={draft.heroEyebrow}
              onChange={(e) => setDraft({ ...draft, heroEyebrow: e.target.value })}
              className={field}
            />
          </label>

          <label className="block text-sm">
            Headline
            <input
              value={draft.heroTitle}
              onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
              className={field}
            />
          </label>

          <label className="block text-sm">
            Subtitle
            <textarea
              rows={3}
              value={draft.heroSubtitle}
              onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
              className={field}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Primary button
              <input
                value={draft.heroPrimaryCta}
                onChange={(e) => setDraft({ ...draft, heroPrimaryCta: e.target.value })}
                className={field}
              />
            </label>
            <label className="block text-sm">
              Secondary button
              <input
                value={draft.heroSecondaryCta}
                onChange={(e) => setDraft({ ...draft, heroSecondaryCta: e.target.value })}
                className={field}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="mr-auto rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Reset to original
            </button>
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
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
