import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list-products";
import getProduct from "./tools/get-product";
import searchProducts from "./tools/search-products";
import listCategories from "./tools/list-categories";

// The OAuth issuer MUST be the direct Supabase host; the .lovable.cloud proxy
// URL fails RFC 8414 issuer matching. Build it from the project ref, which is
// stable across publish.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "hunza-hunar-mcp",
  title: "Hunza Hunar Shop",
  version: "0.2.0",
  instructions:
    "Browse the Hunza Hunar catalog of authentic products from Hunza, Pakistan: honey, dry fruits, herbal goods, and handmade crafts. Requires sign-in. Use `list_categories` to see sections, `list_products` to browse (optionally filtered by category), `search_products` for keyword search, and `get_product` for full details on one item.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCategories, listProducts, searchProducts, getProduct],
});
