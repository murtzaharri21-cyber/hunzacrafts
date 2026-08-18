import placeholder from "@/assets/product-placeholder.jpg";
import crafts from "@/assets/product-crafts.jpg";
import honey from "@/assets/product-honey.jpg";

export type Category =
  | "food"
  | "dry-fruits"
  | "organic"
  | "handicrafts"
  | "honey"
  | "herbal"
  | "gifts";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  salePrice?: number;
  category: Category;
  shortDescription: string;
  description: string;
  ingredients?: string;
  origin: string;
  sku: string;
  inventory: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  images: string[];
};

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "dry-fruits", label: "Dry Fruits" },
  { value: "organic", label: "Organic Products" },
  { value: "handicrafts", label: "Handicrafts" },
  { value: "honey", label: "Honey" },
  { value: "herbal", label: "Herbal Products" },
  { value: "gifts", label: "Gifts" },
];

// Replace `images` arrays with your uploaded photos when ready.
// Structure supports multiple images per product for the gallery.
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    slug: "wild-hunza-honey",
    name: "Wild Hunza Honey",
    price: 2400,
    salePrice: 1990,
    category: "honey",
    shortDescription: "Raw, unfiltered highland honey from wildflower meadows.",
    description:
      "Harvested by hand from remote apiaries above 2,500m, our wild honey carries the aroma of alpine flowers and a golden, slow-crystallising body.",
    ingredients: "100% raw honey. Nothing added.",
    origin: "Karimabad, Hunza",
    sku: "HZ-HNY-500",
    inventory: 42,
    featured: true,
    images: [honey, placeholder],
  },
  {
    id: "p2",
    slug: "sun-dried-apricots",
    name: "Sun-Dried Hunza Apricots",
    price: 1600,
    category: "dry-fruits",
    shortDescription: "Naturally sweet, sun-cured apricots with no additives.",
    description:
      "Small-batch dried under Hunza's clear skies. Chewy, tart-sweet, and rich in beta-carotene.",
    ingredients: "Sun-dried apricots.",
    origin: "Altit Valley",
    sku: "HZ-APR-250",
    inventory: 120,
    bestseller: true,
    isNew: true,
    images: [placeholder],
  },
  {
    id: "p3",
    slug: "cold-pressed-apricot-oil",
    name: "Cold-Pressed Apricot Kernel Oil",
    price: 3200,
    category: "organic",
    shortDescription: "Silky, single-origin oil for skin, hair, and cooking.",
    description:
      "Pressed from bitter apricot kernels within 48 hours of harvest. Light, nourishing, and unrefined.",
    ingredients: "100% apricot kernel oil.",
    origin: "Ganish, Hunza",
    sku: "HZ-OIL-100",
    inventory: 30,
    featured: true,
    images: [placeholder],
  },
  {
    id: "p4",
    slug: "himalayan-walnuts",
    name: "Himalayan Walnuts",
    price: 1800,
    category: "dry-fruits",
    shortDescription: "Thin-shell, buttery walnuts from ancient trees.",
    description:
      "Harvested from centuries-old orchards. Rich, buttery halves — perfect raw, roasted or in baking.",
    origin: "Gulmit, Upper Hunza",
    sku: "HZ-WAL-300",
    inventory: 85,
    images: [placeholder],
  },
  {
    id: "p5",
    slug: "mountain-almonds",
    name: "Mountain Almonds",
    price: 1500,
    category: "dry-fruits",
    shortDescription: "Sweet, crisp almonds from Hunza orchards.",
    description: "Naturally grown, hand-shelled almonds with a delicate sweetness.",
    origin: "Nagar Valley",
    sku: "HZ-ALM-300",
    inventory: 70,
    images: [placeholder],
  },
  {
    id: "p6",
    slug: "tumuru-herbal-tea",
    name: "Tumuru Herbal Tea",
    price: 900,
    category: "herbal",
    shortDescription: "Wild-foraged mountain pepper tea, warming and citrusy.",
    description:
      "A traditional Hunza infusion made from tumuru berries. Naturally caffeine-free.",
    ingredients: "Wild tumuru berries.",
    origin: "Chapursan Valley",
    sku: "HZ-TEA-100",
    inventory: 60,
    isNew: true,
    images: [placeholder],
  },
  {
    id: "p7",
    slug: "sea-buckthorn-juice",
    name: "Sea Buckthorn Juice",
    price: 1400,
    category: "organic",
    shortDescription: "Tart, vitamin-rich juice from wild mountain berries.",
    description:
      "Cold-pressed from wild sea buckthorn. Sharp, bright, and loaded with vitamin C.",
    origin: "Passu, Hunza",
    sku: "HZ-SBJ-500",
    inventory: 40,
    featured: true,
    images: [placeholder],
  },
  {
    id: "p8",
    slug: "handwoven-wool-shawl",
    name: "Handwoven Wool Shawl",
    price: 6500,
    category: "handicrafts",
    shortDescription: "Warm, naturally dyed shawl woven on a traditional loom.",
    description:
      "Each shawl takes over a week to weave. Made from local highland wool and plant dyes.",
    ingredients: "100% highland wool.",
    origin: "Karimabad artisan collective",
    sku: "HZ-SHW-01",
    inventory: 12,
    featured: true,
    bestseller: true,
    images: [crafts, placeholder],
  },
  {
    id: "p9",
    slug: "traditional-hunza-cap",
    name: "Traditional Hunza Cap",
    price: 1800,
    category: "handicrafts",
    shortDescription: "Hand-knitted wool cap with heritage patterns.",
    description:
      "The iconic rolled-brim cap of Hunza, knitted by hand in natural undyed wool.",
    origin: "Hyderabad, Hunza",
    sku: "HZ-CAP-01",
    inventory: 25,
    images: [crafts, placeholder],
  },
  {
    id: "p10",
    slug: "walnut-wood-bowl",
    name: "Walnut Wood Bowl",
    price: 2900,
    category: "handicrafts",
    shortDescription: "Hand-turned bowl from fallen walnut wood.",
    description:
      "Each bowl is turned by hand and finished with food-safe oil. Natural grain — no two alike.",
    origin: "Ganish workshop",
    sku: "HZ-WBW-01",
    inventory: 18,
    isNew: true,
    images: [placeholder],
  },
  {
    id: "p11",
    slug: "hunza-taster-gift-box",
    name: "Hunza Taster Gift Box",
    price: 4800,
    salePrice: 4200,
    category: "gifts",
    shortDescription: "A curated selection of Hunza's most-loved foods.",
    description:
      "Honey, apricots, walnuts and herbal tea, packed in a reusable wooden crate. Ready to gift.",
    origin: "Curated in Karimabad",
    sku: "HZ-GFT-01",
    inventory: 22,
    featured: true,
    bestseller: true,
    images: [placeholder],
  },
  {
    id: "p12",
    slug: "wild-thyme-honey",
    name: "Wild Thyme Honey",
    price: 2600,
    category: "honey",
    shortDescription: "Aromatic single-origin honey from thyme meadows.",
    description:
      "Distinctly herbal with a long finish. Rare, small-batch and unpasteurised.",
    ingredients: "100% raw thyme honey.",
    origin: "Shimshal, Upper Hunza",
    sku: "HZ-HNY-THY",
    inventory: 20,
    images: [honey, placeholder],
  },
  {
    id: "p13",
    slug: "embroidered-cross-stitch-cap",
    name: "Embroidered Cross-Stitch Cap",
    price: 2200,
    category: "handicrafts",
    shortDescription: "Vibrant hand-embroidered cap with star motifs.",
    description:
      "A striking rolled-brim cap adorned with dense cross-stitch embroidery in ochre, purple and green. Each cap takes several days to complete by a single artisan.",
    origin: "Karimabad artisan collective",
    sku: "HZ-CAP-02",
    inventory: 15,
    isNew: true,
    featured: true,
    images: [crafts],
  },
  {
    id: "p14",
    slug: "silk-kurta-hand-embroidered",
    name: "Silk Kurta with Hand-Embroidered Placket",
    price: 7800,
    category: "handicrafts",
    shortDescription: "Saffron silk kurta with traditional Hunza embroidery.",
    description:
      "Lightweight silk kurta featuring a hand-embroidered front placket in classic Hunza geometric motifs. Cut for a relaxed, breathable fit.",
    origin: "Aliabad tailor's atelier",
    sku: "HZ-KRT-01",
    inventory: 8,
    featured: true,
    images: [crafts],
  },
  {
    id: "p15",
    slug: "rose-cotton-dress",
    name: "Rose Cotton Dress with Embroidered Trim",
    price: 6900,
    category: "handicrafts",
    shortDescription: "Soft pink cotton dress with hand-stitched neckline trim.",
    description:
      "A flowing everyday dress in rose cotton, finished with a hand-embroidered neckline in traditional Hunza patterns.",
    origin: "Gulmit tailoring co-op",
    sku: "HZ-DRS-01",
    inventory: 10,
    isNew: true,
    images: [crafts],
  },
  {
    id: "p16",
    slug: "cross-stitch-panel-set",
    name: "Cross-Stitch Panel Set",
    price: 3800,
    category: "handicrafts",
    shortDescription: "Framed cross-stitch panels for décor or gifting.",
    description:
      "A set of three hand-stitched cross-stitch panels, mounted and ready to display. Perfect as heirloom gifts.",
    origin: "Craftainment, Hunza",
    sku: "HZ-PNL-03",
    inventory: 14,
    images: [crafts],
  },
  {
    id: "p17",
    slug: "embroidered-patch-collection",
    name: "Embroidered Patch Collection",
    price: 2400,
    category: "handicrafts",
    shortDescription: "Assorted hand-embroidered patches and trims.",
    description:
      "A curated bundle of round and strip patches in traditional Hunza colourways. Use as appliqué on garments, cushions, or bags.",
    origin: "Karimabad",
    sku: "HZ-PCH-01",
    inventory: 30,
    images: [crafts],
  },
  {
    id: "p18",
    slug: "ceremonial-cross-stitch-cap",
    name: "Ceremonial Cross-Stitch Cap",
    price: 2600,
    category: "handicrafts",
    shortDescription: "Bright green and magenta cap with intricate motifs.",
    description:
      "A festive cap with dense cross-stitch embroidery in emerald, magenta and gold — worn on celebrations and gatherings in Hunza.",
    origin: "Nagar Valley artisans",
    sku: "HZ-CAP-03",
    inventory: 12,
    bestseller: true,
    images: [crafts],
  },
  {
    id: "p19",
    slug: "monochrome-embroidered-runner",
    name: "Monochrome Embroidered Runner",
    price: 5400,
    category: "handicrafts",
    shortDescription: "Ivory and indigo cross-stitch table runner.",
    description:
      "A long table runner hand-stitched in classic ivory and indigo geometric patterns. Reversible and finished with a plain cotton backing.",
    origin: "Gilgit-Baltistan co-op",
    sku: "HZ-RNR-01",
    inventory: 6,
    featured: true,
    images: [crafts],
  },
  {
    id: "p20",
    slug: "artisan-embroidered-cap",
    name: "Artisan Embroidered Cap",
    price: 2000,
    category: "handicrafts",
    shortDescription: "Cap embroidered by a Hunza master craftswoman.",
    description:
      "Each cap in this batch is stitched by named artisans in Karimabad — a small tribute to the women who keep this craft alive.",
    origin: "Karimabad",
    sku: "HZ-CAP-04",
    inventory: 18,
    images: [crafts, placeholder],
  },
];

export function getProduct(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function formatPKR(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}
