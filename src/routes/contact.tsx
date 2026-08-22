import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Mail, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/lib/admin-context";
import { useSiteContent } from "@/lib/site-content";
import { EditContactDialog } from "@/components/EditContactDialog";

function getWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0092")) return digits.slice(2);
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hunza & Co." },
      {
        name: "description",
        content: "Get in touch with Hunza & Co. — questions, wholesale, or a friendly hello.",
      },
      { property: "og:title", content: "Contact — Hunza & Co." },
      {
        property: "og:description",
        content: "Get in touch with Hunza & Co. — questions, wholesale, or a friendly hello.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [numberCopied, setNumberCopied] = useState(false);
  const { isAdmin } = useAdmin();
  const { content } = useSiteContent();
  const whatsAppNumber = getWhatsAppNumber(content.contactWhatsApp);
  const whatsAppMessage = "Hello Hunza & Co., I'd like to ask about a product.";
  return (
    <SiteLayout>
      <section className="container-x pt-16 md:pt-20">
        <div className="flex items-center gap-3">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
          {isAdmin && (
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3 w-3" /> Edit details
            </button>
          )}
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Say hello</h1>
        <p className="mt-3 max-w-lg text-muted-foreground">
          Questions about a product, wholesale, or a friendly hello — we'd love to hear from you.
        </p>
      </section>

      <section className="container-x mt-10 grid gap-10 pb-24 md:mt-14 md:grid-cols-[1fr_360px] md:gap-14">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="rounded-3xl border border-border p-6 md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm">Name</span>
              <input
                required
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
              />
            </label>
            <label className="block">
              <span className="text-sm">Email</span>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm">Subject</span>
            <input className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40" />
          </label>
          <label className="mt-4 block">
            <span className="text-sm">Message</span>
            <textarea
              required
              rows={6}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
            />
          </label>
          <button className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/90">
            {sent ? "Message sent — thank you" : "Send Message"}
          </button>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-secondary/50 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-medium">Visit</div>
                <div className="text-sm text-muted-foreground">
                  {content.contactAddress1}
                  <br />
                  {content.contactAddress2}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-medium">Email</div>
                <a
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href={`mailto:${content.contactEmail}`}
                >
                  {content.contactEmail}
                </a>
              </div>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-medium">Call</div>
                <a
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href={`tel:${content.contactPhone.replace(/\s/g, "")}`}
                >
                  {content.contactPhone}
                </a>
              </div>
            </div>
            <div className="mt-6 grid gap-2">
              <Button asChild className="h-11 w-full rounded-full">
                <a
                  href={`whatsapp://send?phone=${whatsAppNumber}&text=${encodeURIComponent(whatsAppMessage)}`}
                  onClick={(event) => {
                    if (/Android/i.test(navigator.userAgent)) {
                      event.preventDefault();
                      window.location.href = `intent://send?phone=${whatsAppNumber}&text=${encodeURIComponent(whatsAppMessage)}#Intent;scheme=whatsapp;package=com.whatsapp;end`;
                    }
                  }}
                >
                  <MessageCircle /> Open WhatsApp app
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(`+${whatsAppNumber}`);
                  setNumberCopied(true);
                  window.setTimeout(() => setNumberCopied(false), 2000);
                }}
              >
                {numberCopied ? <Check /> : <Copy />}
                {numberCopied ? "Number copied" : "Copy WhatsApp number"}
              </Button>
            </div>
          </div>

          <div className="aspect-video overflow-hidden rounded-3xl bg-muted">
            <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">
              Map placeholder
            </div>
          </div>
        </aside>
      </section>
      <EditContactDialog open={editOpen} onOpenChange={setEditOpen} />
    </SiteLayout>
  );
}
