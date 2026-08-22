import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Middleware to separate admin routes from the main site.
// If ADMIN_URL or VITE_ADMIN_URL is set, requests to /admin* will be redirected there.
// Otherwise, /admin requests return 404 Not Found.
const adminRedirectMiddleware = createMiddleware().server(async (ctx: any) => {
  const { next, req } = ctx;
  try {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/admin")) {
      const adminUrl = process.env.ADMIN_URL || process.env.VITE_ADMIN_URL;
      if (adminUrl) {
        // Preserve the remainder of the path after /admin when redirecting
        const remainder = url.pathname.replace(/^\/admin/, "") || "/";
        const target = adminUrl.replace(/\/$/, "") + remainder + url.search;
        return Response.redirect(target, 302);
      }

      return new Response("Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  } catch (e) {
    // If anything goes wrong, fall through to next middleware so errorMiddleware can handle it.
    console.error("adminRedirectMiddleware error:", e);
  }
  return await next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [adminRedirectMiddleware, errorMiddleware],
}));
