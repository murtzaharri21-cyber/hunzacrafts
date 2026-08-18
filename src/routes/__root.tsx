import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart-context";
import { WishlistProvider } from "../lib/wishlist-context";
import { AdminProvider } from "../lib/admin-context";
import { SiteContentProvider } from "../lib/site-content";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 font-display text-xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hunza & Co. — Authentic Products from the Heart of Hunza" },
      {
        name: "description",
        content:
          "Discover sun-dried apricots, wild honey, handwoven shawls and organic products sourced directly from the farmers and artisans of Hunza Valley.",
      },
      { property: "og:site_name", content: "Hunza & Co." },
      { property: "og:title", content: "Hunza & Co. — Authentic Products from the Heart of Hunza" },
      {
        property: "og:description",
        content: "Discover sun-dried apricots, wild honey, handwoven shawls and organic products sourced directly from the farmers and artisans of Hunza Valley.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hunza & Co. — Authentic Products from the Heart of Hunza" },
      { name: "twitter:description", content: "Discover sun-dried apricots, wild honey, handwoven shawls and organic products sourced directly from the farmers and artisans of Hunza Valley." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c1bc1436-39f4-4880-9eba-60eabc96bcbb" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c1bc1436-39f4-4880-9eba-60eabc96bcbb" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    // Lazy import so Supabase client is only loaded in the browser bundle.
    let cleanup = () => {};
    import("@/integrations/supabase/client")
      .then(({ supabase }) => {
        const sub = supabase.auth.onAuthStateChange((event) => {
          if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
          router.invalidate();
          if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
        });
        cleanup = () => sub.data.subscription.unsubscribe();
      })
      .catch(() => {});
    return () => cleanup();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <SiteContentProvider>
        <WishlistProvider>
          <CartProvider>
            <Outlet />
          </CartProvider>
        </WishlistProvider>
        </SiteContentProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

