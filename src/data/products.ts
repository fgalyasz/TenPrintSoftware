import type { UiKey } from "~/i18n/ui";

export type PricingTier = {
  kind: "free" | "pro";
  price: string;
  checkoutUrl?: string;
  perks: UiKey[];
};

export type ProductScreenshot = {
  key: "hero" | "editor" | "preferences" | "menu" | "selector";
  themed?: boolean;
};

export type Product = {
  slug: string;
  name: string;
  order: number;
  status: "stable" | "beta";
  accent: string;
  accentSoft: string;
  iconUrl: string;
  websiteUrl: string;
  repositoryUrl?: string;
  supportEmail: string;
  version: string;
  downloadUrl: string;
  downloadFallbackUrl: string;
  packageFormat: string;
  requirements: string;
  categoryKey: "category.windowing" | "category.session";
  model: "free" | "freemium";
  tiers: PricingTier[];
  screenshots: ProductScreenshot[];
  mock?: "sessionguard-menu";
};

export const PRODUCTS: Product[] = [
  {
    slug: "snappyzones",
    name: "SnappyZones",
    order: 1,
    status: "stable",
    accent: "#7c5cff",
    accentSoft: "#a48bff",
    iconUrl: "/assets/products/snappyzones.svg",
    websiteUrl: "https://snappyzones.com",
    supportEmail: "info@snappyzones.com",
    version: "1.3.2",
    downloadUrl: "https://snappyzones.com/downloads/SnappyZones-1.3.2.dmg",
    downloadFallbackUrl: "https://snappyzones.com/#download",
    packageFormat: "DMG",
    requirements: "macOS 13 Ventura+",
    categoryKey: "category.windowing",
    model: "freemium",
    tiers: [
      {
        kind: "free",
        price: "€0",
        perks: [
          "pricing.snappyzones.free.1",
          "pricing.snappyzones.free.2",
          "pricing.snappyzones.free.3",
          "pricing.snappyzones.free.4",
        ],
      },
      {
        kind: "pro",
        price: "€19",
        checkoutUrl: "https://snappyzones.com/#pro",
        perks: [
          "pricing.snappyzones.pro.1",
          "pricing.snappyzones.pro.2",
          "pricing.snappyzones.pro.3",
          "pricing.snappyzones.pro.4",
          "pricing.snappyzones.pro.5",
        ],
      },
    ],
    screenshots: [
      { key: "hero", themed: true },
      { key: "editor" },
      { key: "preferences" },
      { key: "selector" },
      { key: "menu" },
    ],
  },
  {
    slug: "sessionguard",
    name: "SessionGuard",
    order: 2,
    status: "stable",
    accent: "#14b8a6",
    accentSoft: "#5eead4",
    iconUrl: "/assets/products/sessionguard.svg",
    websiteUrl: "https://sessionguard.net",
    repositoryUrl: "https://github.com/fgalyasz/SessionGuard",
    supportEmail: "info@sessionguard.net",
    version: "1.0.1",
    downloadUrl: "https://sessionguard.net/downloads/SessionGuard-1.0.1.dmg",
    downloadFallbackUrl: "https://sessionguard.net/#download",
    packageFormat: "DMG",
    requirements: "macOS 13 Ventura+",
    categoryKey: "category.session",
    model: "free",
    tiers: [
      {
        kind: "free",
        price: "€0",
        perks: [
          "pricing.sessionguard.free.1",
          "pricing.sessionguard.free.2",
          "pricing.sessionguard.free.3",
          "pricing.sessionguard.free.4",
        ],
      },
    ],
    screenshots: [],
    mock: "sessionguard-menu",
  },
];

export function productStyle(product: Product): string {
  return [
    `--product-accent:${product.accent}`,
    `--product-accent-2:${product.accentSoft}`,
    `--accent:${product.accent}`,
    `--accent-2:${product.accentSoft}`,
  ].join(";");
}

export function sortedProducts(): Product[] {
  return [...PRODUCTS].sort((first, second) => first.order - second.order);
}

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function otherProducts(slug: string): Product[] {
  return sortedProducts().filter((product) => product.slug !== slug);
}
