import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Pencil, Youtube } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/lib/admin-context";
import { useSiteContent } from "@/lib/site-content";
import { EditContactDialog } from "@/components/EditContactDialog";

export function Footer() {
  const { isAdmin } = useAdmin();
  const { content } = useSiteContent();
  const [editOpen, setEditOpen] = useState(false);
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="container-x grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="font-display text-xl">Hunza & Co.</div>
          <p className="mt-3 text-sm text-muted-foreground">
            Authentic products from the heart of the Karakoram — sourced directly from the farmers
            and artisans of Hunza.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="rounded-full border border-border p-2 hover:bg-background transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="rounded-full border border-border p-2 hover:bg-background transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="YouTube"
              className="rounded-full border border-border p-2 hover:bg-background transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-foreground">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Dry Fruits
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Honey
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Handicrafts
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About Hunza
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Shipping
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Returns
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Contact</h4>
            {isAdmin && (
              <button
                onClick={() => setEditOpen(true)}
                aria-label="Edit contact details"
                title="Edit contact details"
                className="rounded-full border border-border p-1.5 hover:bg-background"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>{content.contactAddress1}</li>
            <li>{content.contactAddress2}</li>
            <li>{content.contactEmail}</li>
            <li>{content.contactPhone}</li>
          </ul>
        </div>
      </div>
      <EditContactDialog open={editOpen} onOpenChange={setEditOpen} />

      <div className="border-t border-border/60">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Hunza & Co. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Handcrafted with care in the Karakoram.</span>
            <button
              onClick={() => {
                try {
                  // Set a short-lived allow-cookie for admin entry and ensure it's committed before navigation.
                  document.cookie = 'hunza_allow_admin=1; path=/; max-age=' + 60 * 5; // 5 minutes
                  // Use a short delay to ensure the cookie is written in all browsers before navigation.
                  setTimeout(() => {
                    try {
                      window.location.assign('/auth?next=' + encodeURIComponent('/admin'));
                    } catch (e) {
                      window.location.href = '/auth?next=' + encodeURIComponent('/admin');
                    }
                  }, 50);
                } catch (e) {
                  try {
                    window.location.href = '/auth?next=' + encodeURIComponent('/admin');
                  } catch {}
                }
              }}
              className="underline hover:text-foreground"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
