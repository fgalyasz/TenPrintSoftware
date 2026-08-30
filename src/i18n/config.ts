export const DEFAULT_LANGUAGE = "en";

export const LANGUAGES = {
  en: { name: "English", flag: "🇬🇧", htmlLang: "en" },
  de: { name: "Deutsch", flag: "🇩🇪", htmlLang: "de" },
  fr: { name: "Français", flag: "🇫🇷", htmlLang: "fr" },
  es: { name: "Español", flag: "🇪🇸", htmlLang: "es" },
  hu: { name: "Magyar", flag: "🇭🇺", htmlLang: "hu" },
  cs: { name: "Čeština", flag: "🇨🇿", htmlLang: "cs" },
  sk: { name: "Slovenčina", flag: "🇸🇰", htmlLang: "sk" },
  pl: { name: "Polski", flag: "🇵🇱", htmlLang: "pl" },
  ro: { name: "Română", flag: "🇷🇴", htmlLang: "ro" },
  ru: { name: "Русский", flag: "🇷🇺", htmlLang: "ru" },
} as const;

export type Language = keyof typeof LANGUAGES;

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as Language[];

export function isLanguage(value: string | undefined): value is Language {
  return typeof value === "string" && value in LANGUAGES;
}

export function toLanguage(value: string | undefined): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}
