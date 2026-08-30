import { DEFAULT_LANGUAGE, LANGUAGE_CODES, type Language } from "./config";
import { UI, type UiKey } from "./ui";

export type Translate = (key: UiKey, values?: Record<string, string | number>) => string;

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function useTranslations(language: Language): Translate {
  const dictionary = UI[language];
  const fallback = UI[DEFAULT_LANGUAGE];
  return (key, values) => interpolate(dictionary[key] ?? fallback[key] ?? key, values);
}

export function localePath(language: Language, path = ""): string {
  const clean = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return clean.length > 0 ? `/${language}/${clean}/` : `/${language}/`;
}

export function localeParams(): Array<{ params: { lang: Language } }> {
  return LANGUAGE_CODES.map((lang) => ({ params: { lang } }));
}

export { DEFAULT_LANGUAGE, LANGUAGE_CODES };
export type { Language, UiKey };
