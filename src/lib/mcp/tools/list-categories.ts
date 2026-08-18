import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "list_categories",
  title: "List categories",
  description: "List all product categories available in the Hunza Hunar shop.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { CATEGORIES, PRODUCTS } = await import("@/lib/products");
    const items = CATEGORIES.map((c) => ({
      value: c.value,
      label: c.label,
      product_count: PRODUCTS.filter((p) => p.category === c.value).length,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { categories: items },
    };
  },
});
