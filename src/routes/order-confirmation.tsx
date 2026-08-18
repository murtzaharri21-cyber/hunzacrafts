import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Hunza & Co." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const orderId = "HZ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return (
    <SiteLayout>
      <section className="container-x py-24">
        <div className="mx-auto max-w-lg rounded-3xl border border-border p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl">Thank you</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your order <span className="font-medium text-foreground">{orderId}</span> is confirmed. We've sent a receipt to your email.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/shop" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/90">
              Keep shopping
            </Link>
            <Link to="/contact" className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-muted">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
