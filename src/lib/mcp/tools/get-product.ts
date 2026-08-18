import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description: "Fetch full details for a single product by its slug.",
  inputSchema: {
    slug: z.string().min(1).describe("Product slug (e.g. 'wild-hunza-honey')."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const { getProduct } = await import("@/lib/products");
    const product = getProduct(slug);
    if (!product) {
      return {
        content: [{ type: "text", text: `No product found with slug "${slug}".` }],
        isError: true,
      };
    }
    const payload = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      price_pkr: product.price,
      sale_price_pkr: product.salePrice ?? null,
      sku: product.sku,
      origin: product.origin,
      inventory: product.inventory,
      short_description: product.shortDescription,
      description: product.description,
      ingredients: product.ingredients ?? null,
      featured: !!product.featured,
      bestseller: !!product.bestseller,
      is_new: !!product.isNew,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
