// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { resolve } from "node:path";

function windowsMcpPathCompatPlugin() {
  return {
    name: "windows-mcp-path-compat",
    enforce: "pre" as const,
    configResolved(config: { root: string }) {
      if (process.platform === "win32") {
        config.root = resolve(config.root);
      }
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pin Nitro to output Vercel Build Output API format (.vercel/output/)
  // instead of the default Cloudflare Workers format.
  nitro: {
    preset: "vercel",
  },
  vite: {
    plugins: [windowsMcpPathCompatPlugin(), mcpPlugin()],
  },
});
