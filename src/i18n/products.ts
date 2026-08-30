import { DEFAULT_LANGUAGE, type Language } from "./config";

export type ProductFeature = { tier: "free" | "pro"; title: string; text: string };
export type ProductStep = { title: string; text: string };
export type ProductFaq = { question: string; answer: string };

export type ProductCopy = {
  tagline: string;
  headline: string;
  summary: string;
  differentiator: string;
  badges: string[];
  featuresTitle: string;
  featuresSubtitle: string;
  features: ProductFeature[];
  howTitle: string;
  howSubtitle: string;
  how: ProductStep[];
  quickStartTitle: string;
  quickStartSubtitle: string;
  quickStart: ProductStep[];
  faq: ProductFaq[];
  installTitle: string;
  install: string[];
  downloadNotice: string;
  roadmapTitle?: string;
  roadmapSubtitle?: string;
  roadmapInProgress?: string;
  roadmapPlanned?: string;
  roadmap?: ProductStep[];
  editionFree?: string;
  editionPro?: string;
  proTitle?: string;
  proBlurb?: string;
};

const files = import.meta.glob<ProductCopy>("./products/**/*.json", { eager: true, import: "default" });

export function productCopy(slug: string, language: Language): ProductCopy {
  const translated = files[`./products/${slug}/${language}.json`];
  const fallback = files[`./products/${slug}/${DEFAULT_LANGUAGE}.json`];
  if (!fallback) throw new Error(`Missing product copy for "${slug}"`);
  return { ...fallback, ...(translated ?? {}) };
}
