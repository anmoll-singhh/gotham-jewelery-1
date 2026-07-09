/**
 * shopify.ts — Storefront API client for the headless checkout.
 *
 * The product page is already wired to call `createCartAndCheckout()`. To go
 * live, set two env vars (Vite exposes `VITE_`-prefixed vars to the client):
 *
 *   VITE_SHOPIFY_DOMAIN=your-store.myshopify.com
 *   VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   (public Storefront token)
 *
 * Nothing else changes: Add-to-Cart → cart drawer → "Secure Checkout" calls
 * this module, which mints a Shopify cart and returns `cart.checkoutUrl`
 * (Shop Pay / Apple Pay / cards handled by Shopify's hosted checkout).
 */

const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN as string | undefined;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN as string | undefined;
const API_VERSION = "2025-01";

export function isShopifyConfigured(): boolean {
  return Boolean(DOMAIN && TOKEN);
}

export interface CartLineInput {
  merchandiseId: string; // Shopify variant GID
  quantity: number;
}

const CART_CREATE = /* GraphQL */ `
  mutation cartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!isShopifyConfigured()) {
    throw new Error("SHOPIFY_NOT_CONFIGURED");
  }
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN as string,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Storefront API error");
  return json.data as T;
}

/**
 * Create a Shopify cart from the given lines and return the hosted checkout URL.
 * Throws "SHOPIFY_NOT_CONFIGURED" until the env vars are set — the UI catches
 * this and shows a graceful "checkout coming online" message.
 */
export async function createCartAndCheckout(lines: CartLineInput[]): Promise<string> {
  type Resp = {
    cartCreate: {
      cart: { id: string; checkoutUrl: string; totalQuantity: number } | null;
      userErrors: { field: string[]; message: string }[];
    };
  };
  const data = await storefront<Resp>(CART_CREATE, { lines });
  const err = data.cartCreate.userErrors[0];
  if (err) throw new Error(err.message);
  const url = data.cartCreate.cart?.checkoutUrl;
  if (!url) throw new Error("No checkout URL returned");
  return url;
}
