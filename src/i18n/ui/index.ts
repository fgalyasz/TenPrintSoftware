import type { Language } from "../config";
import { LANGUAGE_CODES } from "../config";
import { en, type UiKey } from "./en";

export type UiDictionary = Partial<Record<UiKey, string>>;

type LocaleModule = Record<string, UiDictionary>;

const modules = import.meta.glob<LocaleModule>("./*.ts", { eager: true });

function readDictionary(language: Language): UiDictionary {
  const module = modules[`./${language}.ts`];
  const dictionary = module?.[language];
  return dictionary ?? {};
}

export const UI = Object.fromEntries(
  LANGUAGE_CODES.map((language) => [
    language,
    language === "en" ? (en as UiDictionary) : readDictionary(language),
  ]),
) as Record<Language, UiDictionary>;

export type { UiKey };
