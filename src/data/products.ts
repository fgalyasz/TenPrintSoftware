import type { UiKey } from "~/i18n/ui";

export type PricingTier = {
  kind: "free" | "pro";
  price: string;
  checkoutUrl?: string;
  perks: UiKey[];
};

export type ProductScreenshot = {
  key: "editor" | "preferences" | "menu" | "selector";
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
  mock?: "sessionguard-menu" | "walkaway-menu";
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
    websiteUrl: "https://tenprintsoftware.com/en/products/snappyzones",
    supportEmail: "hello@tenprintsoftware.com",
    version: "1.3.4",
    downloadUrl: "https://tenprintsoftware.com/downloads/snappyzones/SnappyZones-1.3.4.dmg",
    downloadFallbackUrl: "https://tenprintsoftware.com/en/products/snappyzones",
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
        checkoutUrl: "https://buy.polar.sh/polar_cl_w6FOYtMc3UZNShZfm7Z4hHvAVo8Y0bDr3oH4L3ls7Uj",
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
      { key: "menu" },
      { key: "preferences" },
      { key: "editor" },
      { key: "selector" },
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
    websiteUrl: "https://tenprintsoftware.com/en/products/sessionguard",
    repositoryUrl: "https://github.com/fgalyasz/SessionGuard",
    supportEmail: "hello@tenprintsoftware.com",
    version: "1.1.0",
    downloadUrl: "https://tenprintsoftware.com/downloads/sessionguard/SessionGuard-1.1.0.dmg",
    downloadFallbackUrl: "https://tenprintsoftware.com/en/products/sessionguard",
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
    screenshots: [{ key: "preferences" }],
    mock: "sessionguard-menu",
  },
  {
    slug: "walkaway",
    name: "WalkAway",
    order: 3,
    status: "beta",
    accent: "#ea580c",
    accentSoft: "#fb923c",
    iconUrl: "/assets/products/walkaway.svg",
    websiteUrl: "https://tenprintsoftware.com/en/products/walkaway",
    repositoryUrl: "https://github.com/fgalyasz/WalkAway",
    supportEmail: "hello@tenprintsoftware.com",
    version: "0.1.12",
    downloadUrl: "https://tenprintsoftware.com/downloads/walkaway/WalkAway-0.1.12.dmg",
    downloadFallbackUrl: "https://tenprintsoftware.com/en/products/walkaway",
    packageFormat: "DMG",
    requirements: "macOS 13 Ventura+",
    categoryKey: "category.session",
    model: "free",
    tiers: [
      {
        kind: "free",
        price: "€0",
        perks: [
          "pricing.walkaway.free.1",
          "pricing.walkaway.free.2",
          "pricing.walkaway.free.3",
          "pricing.walkaway.free.4",
        ],
      },
    ],
    screenshots: [{ key: "preferences" }],
    mock: "walkaway-menu",
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
