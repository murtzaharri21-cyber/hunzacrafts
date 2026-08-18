import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

export function EditContactDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { content, update } = useSiteContent();
  const [draft, setDraft] = useState(content);

  useEffect(() => {
    if (open) setDraft(content);
  }, [open, content]);

  if (!open) return null;

  const field =
    "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

  function submit(e: FormEvent) {
    e.preventDefault();
    update({
      contactAddress1: draft.contactAddress1,
      contactAddress2: draft.contactAddress2,
      contactEmail: draft.contactEmail,
      contactPhone: draft.contactPhone,
      contactWhatsApp: draft.contactWhatsApp,
    });
    onOpenChange(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-border bg-background p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl">Edit contact details</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Shown in the footer and on the contact page.
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
            Address line 1
            <input
              value={draft.contactAddress1}
              onChange={(e) => setDraft({ ...draft, contactAddress1: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-sm">
            Address line 2
            <input
              value={draft.contactAddress2}
              onChange={(e) => setDraft({ ...draft, contactAddress2: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-sm">
            Email
            <input
              type="email"
              value={draft.contactEmail}
              onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-sm">
            Phone
            <input
              value={draft.contactPhone}
              onChange={(e) => setDraft({ ...draft, contactPhone: e.target.value })}
              className={field}
            />
          </label>
          <label className="block text-sm">
            WhatsApp number (digits only)
            <input
              value={draft.contactWhatsApp}
              onChange={(e) => setDraft({ ...draft, contactWhatsApp: e.target.value })}
              className={field}
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
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
