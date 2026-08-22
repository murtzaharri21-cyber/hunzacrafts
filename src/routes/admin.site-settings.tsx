import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useAdmin } from "@/lib/admin-context";
import { useSiteContent, saveRemoteSiteContent, type SiteContent } from "@/lib/site-content";
import { useState } from "react";

export const Route = createFileRoute("/admin/site-settings")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin — Site Content — Hunza & Co." }, { name: "robots", content: "noindex" }],
  }),
  component: SiteContentEditor,
});

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
      />
    </div>
  );
}

function SiteContentEditor() {
  const { isAdmin } = useAdmin();
  const { content, update, reset } = useSiteContent();
  const [saving, setSaving] = useState(false);
  const [local, setLocal] = useState<SiteContent>(() => ({ ...content }));

  // Keep local copy in sync when content changes remotely
  if (JSON.stringify(local) !== JSON.stringify(content)) {
    setLocal({ ...content });
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <div className="container-x pt-12">
          <div className="rounded-3xl border border-border p-8 text-center">Admin access required</div>
        </div>
      </SiteLayout>
    );
  }

  const applyPatch = (patch: Partial<SiteContent>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    update(patch);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // Persist immediately — SiteContentProvider will also save via its effect, but call directly to be explicit
      await saveRemoteSiteContent(local);
    } catch (e) {
      console.error("Failed saving site content", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SiteLayout>
      <section className="container-x pt-12 md:pt-16">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Content</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Site content & branding</h1>
        </div>
        <p className="mt-3 max-w-xl text-muted-foreground">Edit headings, hero, contact info, and footer content live.</p>
      </section>

      <section className="container-x mt-8 pb-24">
        <div className="max-w-3xl">
          <Field label="Hero image URL" value={local.heroImage} onChange={(v) => applyPatch({ heroImage: v })} placeholder="https://..." />
          <Field label="Hero eyebrow" value={local.heroEyebrow} onChange={(v) => applyPatch({ heroEyebrow: v })} />
          <Field label="Hero title" value={local.heroTitle} onChange={(v) => applyPatch({ heroTitle: v })} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground">Hero subtitle</label>
            <textarea
              value={local.heroSubtitle}
              onChange={(e) => applyPatch({ heroSubtitle: e.target.value })}
              className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
              rows={4}
            />
          </div>
          <Field label="Primary CTA" value={local.heroPrimaryCta} onChange={(v) => applyPatch({ heroPrimaryCta: v })} />
          <Field label="Secondary CTA" value={local.heroSecondaryCta} onChange={(v) => applyPatch({ heroSecondaryCta: v })} />

          <h2 className="mt-6 mb-3 text-lg font-medium">Contact</h2>
          <Field label="Address line 1" value={local.contactAddress1} onChange={(v) => applyPatch({ contactAddress1: v })} />
          <Field label="Address line 2" value={local.contactAddress2} onChange={(v) => applyPatch({ contactAddress2: v })} />
          <Field label="Email" value={local.contactEmail} onChange={(v) => applyPatch({ contactEmail: v })} />
          <Field label="Phone" value={local.contactPhone} onChange={(v) => applyPatch({ contactPhone: v })} />
          <Field label="WhatsApp" value={local.contactWhatsApp} onChange={(v) => applyPatch({ contactWhatsApp: v })} />

          <div className="mt-6 flex gap-3">
            <button onClick={onSave} disabled={saving} className="inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm text-background">
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                reset();
              }}
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
