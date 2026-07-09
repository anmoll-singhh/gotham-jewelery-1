/**
 * products.ts — Mock catalog for the headless Shopify storefront.
 *
 * These types intentionally mirror the **Shopify Storefront API** `Product`
 * shape so that swapping this mock for a live GraphQL query is a drop-in:
 *   Storefront `product(handle:)` → Product
 *   product.variants.nodes        → Product.variants
 *   product.options              → Product.options
 *   variant.price / compareAtPrice→ Money
 *
 * When Shopify is connected, delete the PRODUCTS array and have getProduct()
 * / getRelatedProducts() call `src/lib/shopify.ts`. Nothing in Product.tsx
 * needs to change — it only reads this shape.
 */

export interface Money {
  amount: number;        // Storefront returns a string; we use number for formatting
  currencyCode: string;  // e.g. "USD"
}

export interface ProductImage {
  url: string;
  altText: string;
}

export interface SelectedOption {
  name: string;   // e.g. "Condition"
  value: string;  // e.g. "Certified Pre-Owned"
}

export interface ProductVariant {
  id: string;                       // Shopify variant GID: "gid://shopify/ProductVariant/…"
  title: string;
  price: Money;
  compareAtPrice?: Money | null;    // for strikethrough / "you save"
  availableForSale: boolean;
  quantityAvailable: number;
  selectedOptions: SelectedOption[];
  image?: ProductImage;
  sku?: string;
}

export interface ProductOption {
  name: string;      // e.g. "Bracelet"
  values: string[];  // e.g. ["Oyster", "Jubilee"]
}

export interface Review {
  author: string;
  location?: string;
  rating: number;        // 1–5
  date: string;          // ISO
  title: string;
  body: string;
  verified: boolean;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;                 // Shopify product GID
  handle: string;             // URL slug — /products/:handle
  title: string;
  vendor: string;             // brand
  productType: string;        // "Watch" | "Ring" | …
  tagline: string;            // short marketing line under the title
  descriptionHtml: string;
  featuredImage: ProductImage;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  specs: SpecRow[];
  highlights: string[];       // bullet value-props in the buy box
  rating: number;
  reviewCount: number;
  reviews: Review[];
  // Conversion metadata
  inStock: number;            // units of the default variant (scarcity)
  soldRecently?: string;      // e.g. "3 sold in the last 30 days"
  financeFromMonthly?: Money; // "from $X/mo"
  financeMonths?: number;
  relatedHandles: string[];
}

// ── USD money helper ────────────────────────────────────────────────────────
const usd = (amount: number): Money => ({ amount, currencyCode: "USD" });

export function formatMoney(m: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: m.currencyCode,
    maximumFractionDigits: 0,
  }).format(m.amount);
}

// ─────────────────────────────────────────────────────────────────────────────
// FLAGSHIP — fully-detailed conversion demo product
// ─────────────────────────────────────────────────────────────────────────────
const SUBMARINER: Product = {
  id: "gid://shopify/Product/1001",
  handle: "rolex-submariner-date-126610ln",
  title: "Rolex Submariner Date",
  vendor: "Rolex",
  productType: "Watch",
  tagline: "Ref. 126610LN · Oystersteel · 41mm · Black Cerachrom bezel",
  descriptionHtml:
    "<p>The reference every collection is measured against. This 126610LN pairs the " +
    "unmistakable black Cerachrom bezel with a 41mm Oystersteel case and the calibre 3235 " +
    "movement — 70 hours of power reserve and Rolex's Superlative Chronometer certification.</p>" +
    "<p>Every Gotham timepiece clears our 14-point authentication before it is listed. This " +
    "example arrives with box, papers, and our written guarantee of authenticity.</p>",
  featuredImage: { url: "/assets/gotham-rolex-sub.webp", altText: "Rolex Submariner Date 126610LN" },
  images: [
    { url: "/assets/gotham-rolex-sub.webp",       altText: "Rolex Submariner Date — front" },
    { url: "/assets/gotham-hero-watch-dark.webp",  altText: "Rolex Submariner Date — macro dial" },
    { url: "/assets/editorial-wrist.webp",         altText: "Rolex Submariner Date — on the wrist" },
    { url: "/assets/gotham-banner-rolex.webp",     altText: "Rolex Submariner Date — profile" },
  ],
  options: [
    { name: "Bracelet",     values: ["Oyster"] },
    { name: "Condition",    values: ["Certified Pre-Owned", "Unworn"] },
    { name: "Box & Papers", values: ["Full Set", "Watch Only"] },
  ],
  variants: [
    {
      id: "gid://shopify/ProductVariant/2001",
      title: "Oyster / Certified Pre-Owned / Full Set",
      price: usd(13950),
      compareAtPrice: usd(15200),
      availableForSale: true,
      quantityAvailable: 1,
      sku: "RLX-126610LN-CPO-FS",
      selectedOptions: [
        { name: "Bracelet", value: "Oyster" },
        { name: "Condition", value: "Certified Pre-Owned" },
        { name: "Box & Papers", value: "Full Set" },
      ],
    },
    {
      id: "gid://shopify/ProductVariant/2002",
      title: "Oyster / Certified Pre-Owned / Watch Only",
      price: usd(13250),
      compareAtPrice: usd(14400),
      availableForSale: true,
      quantityAvailable: 1,
      sku: "RLX-126610LN-CPO-WO",
      selectedOptions: [
        { name: "Bracelet", value: "Oyster" },
        { name: "Condition", value: "Certified Pre-Owned" },
        { name: "Box & Papers", value: "Watch Only" },
      ],
    },
    {
      id: "gid://shopify/ProductVariant/2003",
      title: "Oyster / Unworn / Full Set",
      price: usd(16800),
      compareAtPrice: null,
      availableForSale: true,
      quantityAvailable: 1,
      sku: "RLX-126610LN-NEW-FS",
      selectedOptions: [
        { name: "Bracelet", value: "Oyster" },
        { name: "Condition", value: "Unworn" },
        { name: "Box & Papers", value: "Full Set" },
      ],
    },
    {
      id: "gid://shopify/ProductVariant/2004",
      title: "Oyster / Unworn / Watch Only",
      price: usd(16100),
      compareAtPrice: null,
      availableForSale: false,
      quantityAvailable: 0,
      sku: "RLX-126610LN-NEW-WO",
      selectedOptions: [
        { name: "Bracelet", value: "Oyster" },
        { name: "Condition", value: "Unworn" },
        { name: "Box & Papers", value: "Watch Only" },
      ],
    },
  ],
  specs: [
    { label: "Reference", value: "126610LN" },
    { label: "Movement", value: "Automatic · Calibre 3235" },
    { label: "Case Size", value: "41mm" },
    { label: "Case Material", value: "Oystersteel" },
    { label: "Dial", value: "Black" },
    { label: "Bezel", value: "Unidirectional · Black Cerachrom" },
    { label: "Water Resistance", value: "300m / 1,000ft" },
    { label: "Power Reserve", value: "70 hours" },
    { label: "Bracelet", value: "Oyster · folding Oysterlock clasp" },
    { label: "Year", value: "2022" },
  ],
  highlights: [
    "14-point authenticated & serviced in-house",
    "Full set — original box, papers & card",
    "2-year Gotham mechanical warranty",
    "Free fully-insured overnight shipping",
  ],
  rating: 4.9,
  reviewCount: 128,
  reviews: [
    {
      author: "Michael R.",
      location: "New York, NY",
      rating: 5,
      date: "2026-05-18",
      title: "Exactly as described — flawless",
      body: "Third watch I've bought from Gotham. Authentication paperwork was thorough, arrived next day fully insured. The Sub is immaculate.",
      verified: true,
    },
    {
      author: "David L.",
      location: "Greenwich, CT",
      rating: 5,
      date: "2026-04-02",
      title: "The specialist made it effortless",
      body: "Booked a viewing first, then bought. No pressure, real expertise. Financing was approved in minutes.",
      verified: true,
    },
    {
      author: "Anthony P.",
      location: "Miami, FL",
      rating: 4,
      date: "2026-03-11",
      title: "Great watch, quick shipping",
      body: "Would have liked a service history sheet in the box but otherwise the piece is perfect and the price beat the grey market.",
      verified: true,
    },
  ],
  inStock: 1,
  soldRecently: "3 sold in the last 30 days",
  financeFromMonthly: usd(388),
  financeMonths: 36,
  relatedHandles: [
    "rolex-datejust-41-126334",
    "rolex-gmt-master-ii-126720vtnr",
    "patek-philippe-nautilus-5711",
    "audemars-piguet-royal-oak-77350st",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG — lighter records (valid Product shape) for related / cross-sell.
// Mirrors the WATCHES list on the Timepieces page.
// ─────────────────────────────────────────────────────────────────────────────
function makeWatch(cfg: {
  n: number; handle: string; title: string; vendor: string; ref: string;
  img: string; price: number; compareAt?: number; year: string; caseSize: string;
  movement: string; inStock?: number; unavailable?: boolean;
}): Product {
  const variantId = `gid://shopify/ProductVariant/2${cfg.n}0`;
  return {
    id: `gid://shopify/Product/1${cfg.n}`,
    handle: cfg.handle,
    title: cfg.title,
    vendor: cfg.vendor,
    productType: "Watch",
    tagline: `Ref. ${cfg.ref} · ${cfg.caseSize} · ${cfg.vendor}`,
    descriptionHtml:
      `<p>${cfg.title} (Ref. ${cfg.ref}). Every Gotham timepiece clears our 14-point ` +
      `authentication and ships fully insured with a 2-year mechanical warranty.</p>`,
    featuredImage: { url: cfg.img, altText: cfg.title },
    images: [{ url: cfg.img, altText: cfg.title }],
    options: [{ name: "Box & Papers", values: ["Full Set", "Watch Only"] }],
    variants: [
      {
        id: variantId,
        title: "Full Set",
        price: usd(cfg.price),
        compareAtPrice: cfg.compareAt ? usd(cfg.compareAt) : null,
        availableForSale: !cfg.unavailable,
        quantityAvailable: cfg.inStock ?? 1,
        sku: `${cfg.ref}-FS`,
        selectedOptions: [{ name: "Box & Papers", value: "Full Set" }],
      },
    ],
    specs: [
      { label: "Reference", value: cfg.ref },
      { label: "Movement", value: cfg.movement },
      { label: "Case Size", value: cfg.caseSize },
      { label: "Year", value: cfg.year },
    ],
    highlights: [
      "14-point authenticated & serviced",
      "Free fully-insured shipping",
      "2-year Gotham warranty",
    ],
    rating: 4.8,
    reviewCount: 40 + cfg.n,
    reviews: [],
    inStock: cfg.inStock ?? 1,
    financeFromMonthly: usd(Math.round((cfg.price / 36) / 10) * 10),
    financeMonths: 36,
    relatedHandles: ["rolex-submariner-date-126610ln"],
  };
}

const CATALOG: Product[] = [
  makeWatch({ n: 2, handle: "patek-philippe-nautilus-5711", title: "Nautilus 5711/1A", vendor: "Patek Philippe", ref: "5711/1A", img: "/assets/gotham-patek-nautilus.webp", price: 89500, year: "2021", caseSize: "40mm", movement: "Automatic · Calibre 26-330 S C", inStock: 1 }),
  makeWatch({ n: 3, handle: "cartier-santos-chronograph", title: "Santos Chronograph", vendor: "Cartier", ref: "W2SA0008", img: "/assets/gotham-cartier-1.webp", price: 9850, compareAt: 10900, year: "2023", caseSize: "43.3mm", movement: "Automatic · Calibre 1904-CH", inStock: 2 }),
  makeWatch({ n: 4, handle: "audemars-piguet-royal-oak-77350st", title: "Royal Oak 33mm", vendor: "Audemars Piguet", ref: "77350ST", img: "/assets/gotham-ap-product.webp", price: 42500, year: "2024", caseSize: "33mm", movement: "Automatic · Calibre 5900", inStock: 1 }),
  makeWatch({ n: 5, handle: "rolex-submariner-date-gold-126618ln", title: "Submariner Date Gold", vendor: "Rolex", ref: "126618LN", img: "/assets/gotham-rolex-sub-gold.webp", price: 41200, compareAt: 44000, year: "2023", caseSize: "41mm", movement: "Automatic · Calibre 3235", inStock: 1 }),
  makeWatch({ n: 6, handle: "rolex-datejust-41-126334", title: "Datejust 41", vendor: "Rolex", ref: "126334", img: "/assets/gotham-rolex-datejust.webp", price: 12800, compareAt: 13900, year: "2022", caseSize: "41mm", movement: "Automatic · Calibre 3235", inStock: 3 }),
  makeWatch({ n: 7, handle: "rolex-gmt-master-ii-126720vtnr", title: "GMT-Master II Sprite", vendor: "Rolex", ref: "126720VTNR", img: "/assets/gotham-rolex-gmt.webp", price: 21900, year: "2023", caseSize: "40mm", movement: "Automatic · Calibre 3285", inStock: 1 }),
  makeWatch({ n: 8, handle: "rolex-datejust-36-rose", title: "Datejust 36 Rosé", vendor: "Rolex", ref: "126281RBR", img: "/assets/gotham-rolex-rainbow.webp", price: 18400, year: "2022", caseSize: "36mm", movement: "Automatic · Calibre 3235", inStock: 1 }),
];

export const PRODUCTS: Product[] = [SUBMARINER, ...CATALOG];

export function getProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function getRelatedProducts(handle: string): Product[] {
  const p = getProduct(handle);
  if (!p) return [];
  const picks = p.relatedHandles
    .map(getProduct)
    .filter((x): x is Product => Boolean(x));
  // pad from catalog if relatedHandles resolved to fewer than 4
  for (const c of PRODUCTS) {
    if (picks.length >= 4) break;
    if (c.handle !== handle && !picks.includes(c)) picks.push(c);
  }
  return picks.slice(0, 4);
}

/** Slug used by the Timepieces catalog cards to deep-link into a product. */
export function handleForRef(ref: string): string | undefined {
  return PRODUCTS.find((p) => p.specs.some((s) => s.label === "Reference" && s.value === ref))?.handle;
}
