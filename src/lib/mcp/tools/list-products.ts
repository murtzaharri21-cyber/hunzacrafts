import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List products in the Hunza Hunar shop catalog. Optionally filter by category and limit the number of results.",
  inputSchema: {
    category: z
      .enum(["food", "dry-fruits", "organic", "handicrafts", "honey", "herbal", "gifts"])
      .optional()
      .describe("Filter to a single product category."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe("Max items to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, limit }) => {
    const { PRODUCTS } = await import("@/lib/products");
    const filtered = category ? PRODUCTS.filter((p) => p.category === category) : PRODUCTS;
    const items = filtered.slice(0, limit ?? 20).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price_pkr: p.price,
      sale_price_pkr: p.salePrice ?? null,
      origin: p.origin,
      short_description: p.shortDescription,
      in_stock: p.inventory > 0,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { items, total: filtered.length },
    };
  },
});
