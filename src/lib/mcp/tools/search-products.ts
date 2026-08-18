import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search Hunza Hunar products by keyword across name, description, category, and origin.",
  inputSchema: {
    query: z.string().min(1).describe("Search text."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const { PRODUCTS } = await import("@/lib/products");
    const q = query.toLowerCase();
    const matches = PRODUCTS.filter((p) =>
      [p.name, p.shortDescription, p.description, p.category, p.origin]
        .join(" ")
        .toLowerCase()
        .includes(q),
    )
      .slice(0, limit ?? 10)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        price_pkr: p.price,
        short_description: p.shortDescription,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
      structuredContent: { matches, count: matches.length },
    };
  },
});
