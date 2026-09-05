import { PRODUCTS } from "./products";

export const SITE = {
  name: "TenPrint Software",
  url: "https://tenprintsoftware.com",
  domain: "tenprintsoftware.com",
  email: "hello@tenprintsoftware.com",
  supportEmail: "support@tenprintsoftware.com",
  foundedYear: 2025,
  country: "Hungary",
  products: PRODUCTS.map((product) => ({ name: product.name, url: product.websiteUrl })),
} as const;

export const LEGAL_UPDATED = "2026-09-05";
